import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { moderateMessage } from "@/lib/moderation";
import { rateLimit } from "@/lib/rate-limit";
import { MessageImage } from "@/types/Message";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type DbMessage = {
    _id: ObjectId;
    content: string;
    image?: MessageImage;
    createdAt: Date;
    editedAt?: Date;
    status?: "visible";
    userId: string;
    userName: string;
};

const EDIT_WINDOW_MS = 5 * 60 * 1000;
const MAX_IMAGE_SIZE = 1_000_000;
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
] as const;

function serializeMessage(message: DbMessage) {
    return {
        ...message,
        _id: message._id.toString(),
        createdAt: message.createdAt.toISOString(),
        editedAt: message.editedAt?.toISOString(),
    };
}

function sanitizeFileName(name: unknown) {
    if (typeof name !== "string") return "image";
    return name.replace(/[^\w.\- ]/g, "").trim().slice(0, 80) || "image";
}

function validateImage(image: unknown): MessageImage | null {
    if (!image || typeof image !== "object") return null;

    const candidate = image as Partial<MessageImage>;
    if (
        typeof candidate.dataUrl !== "string" ||
        typeof candidate.mimeType !== "string" ||
        typeof candidate.size !== "number"
    ) {
        throw new Error("Image invalide.");
    }

    if (!ALLOWED_IMAGE_TYPES.includes(candidate.mimeType as MessageImage["mimeType"])) {
        throw new Error("Format image non autorise.");
    }

    if (candidate.size <= 0 || candidate.size > MAX_IMAGE_SIZE) {
        throw new Error("Image trop lourde. Maximum 1 Mo.");
    }

    const prefix = `data:${candidate.mimeType};base64,`;
    if (!candidate.dataUrl.startsWith(prefix)) {
        throw new Error("Image invalide.");
    }

    const base64 = candidate.dataUrl.slice(prefix.length);
    const maxBase64Length = Math.ceil(MAX_IMAGE_SIZE / 3) * 4 + 4;
    if (base64.length > maxBase64Length) {
        throw new Error("Image trop lourde. Maximum 1 Mo.");
    }

    if (!/^[a-zA-Z0-9+/]+={0,2}$/.test(base64)) {
        throw new Error("Image invalide.");
    }

    const bytes = Buffer.from(base64, "base64");
    if (bytes.length !== candidate.size || bytes.length > MAX_IMAGE_SIZE) {
        throw new Error("Image invalide.");
    }

    const signatures: Record<MessageImage["mimeType"], boolean> = {
        "image/jpeg": bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
        "image/png":
            bytes[0] === 0x89 &&
            bytes[1] === 0x50 &&
            bytes[2] === 0x4e &&
            bytes[3] === 0x47,
        "image/gif":
            bytes[0] === 0x47 &&
            bytes[1] === 0x49 &&
            bytes[2] === 0x46 &&
            bytes[3] === 0x38,
        "image/webp":
            bytes.toString("ascii", 0, 4) === "RIFF" &&
            bytes.toString("ascii", 8, 12) === "WEBP",
    };

    if (!signatures[candidate.mimeType as MessageImage["mimeType"]]) {
        throw new Error("Le contenu du fichier ne correspond pas au format annonce.");
    }

    return {
        dataUrl: candidate.dataUrl,
        mimeType: candidate.mimeType as MessageImage["mimeType"],
        name: sanitizeFileName(candidate.name),
        size: candidate.size,
    };
}

function moderateOptionalContent(content: unknown, hasImage: boolean) {
    if (typeof content !== "string" || !content.trim()) {
        if (hasImage) return { allowed: true as const, sanitized: "" };
        return { allowed: false as const, reason: "Message vide." };
    }

    return moderateMessage(content);
}

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session)
        return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const db = await getDb();
    const since = request.nextUrl.searchParams.get("since");
    const sinceDate = since ? new Date(since) : null;
    const createdAtFilter =
        sinceDate && !Number.isNaN(sinceDate.getTime())
            ? { createdAt: { $gt: sinceDate } }
            : {};

    const messages = await db
        .collection<DbMessage>("messages")
        .find({
            $or: [{ status: "visible" }, { status: { $exists: false } }],
            ...createdAtFilter,
        })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

    messages.reverse();

    return NextResponse.json(messages.map(serializeMessage));
}

export async function DELETE(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session)
        return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const { _id } = await request.json();

    if (!_id || !ObjectId.isValid(_id))
        return NextResponse.json({ error: "Json non valide" }, { status: 400 });

    const db = await getDb();
    const result = await db.collection("messages").deleteOne({
        _id: new ObjectId(_id),
        userId: session.user.id,
    });

    if (result.deletedCount === 0) {
        return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
    }

    return NextResponse.json({ _id }, { status: 200 });
}

export async function PATCH(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session)
        return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const { _id, content } = await request.json();

    if (!_id || !ObjectId.isValid(_id))
        return NextResponse.json({ error: "Json non valide" }, { status: 400 });

    const db = await getDb();
    const messages = db.collection<DbMessage>("messages");
    const existing = await messages.findOne({
        _id: new ObjectId(_id),
        userId: session.user.id,
        $or: [{ status: "visible" }, { status: { $exists: false } }],
    });

    if (!existing) {
        return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
    }

    if (Date.now() - existing.createdAt.getTime() > EDIT_WINDOW_MS) {
        return NextResponse.json(
            { error: "Le delai de modification de 5 minutes est depasse." },
            { status: 403 },
        );
    }

    const moderation = moderateOptionalContent(content, Boolean(existing.image));
    if (!moderation.allowed) {
        return NextResponse.json({ error: moderation.reason }, { status: 400 });
    }

    const editedAt = new Date();
    await messages.updateOne(
        { _id: existing._id, userId: session.user.id },
        {
            $set: {
                content: moderation.sanitized,
                editedAt,
            },
        },
    );

    return NextResponse.json(
        serializeMessage({
            ...existing,
            content: moderation.sanitized,
            editedAt,
        }),
    );
}

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session)
        return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const limit = rateLimit(`message:${session.user.id}`, {
        limit: 8,
        windowMs: 60_000,
    });

    if (!limit.allowed) {
        return NextResponse.json(
            { error: "Trop de messages. Reessayez dans une minute." },
            { status: 429 },
        );
    }

    const { content, image } = await request.json();

    let safeImage: MessageImage | null = null;
    try {
        safeImage = validateImage(image);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Image invalide." },
            { status: 400 },
        );
    }

    const moderation = moderateOptionalContent(content, Boolean(safeImage));

    if (!moderation.allowed) {
        return NextResponse.json({ error: moderation.reason }, { status: 400 });
    }

    const db = await getDb();
    const message = {
        content: moderation.sanitized,
        ...(safeImage ? { image: safeImage } : {}),
        createdAt: new Date(),
        status: "visible" as const,
        userId: session.user.id,
        userName: session.user.name,
    };
    const result = await db.collection("messages").insertOne(message);

    return NextResponse.json(
        serializeMessage({ ...message, _id: result.insertedId }),
        { status: 201 },
    );
}

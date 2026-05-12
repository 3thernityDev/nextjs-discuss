const RESERVED_NAMES = [
    "admin",
    "administrator",
    "contact",
    "dev",
    "developer",
    "guest",
    "help",
    "info",
    "manager",
    "moderator",
    "nobody",
    "null",
    "operator",
    "owner",
    "qa",
    "root",
    "security",
    "staff",
    "superuser",
    "support",
    "system",
    "team",
    "test",
    "tester",
    "undefined",
    "user",
    "username",
    "webmaster",
];

const BANNED_TERMS = [
    "hitler",
    "nigger",
    "faggot",
    "spic",
    "wetback",
    "chink",
    "gook",
    "kike",
    "slanteye",
    "wop",
    "connard",
    "salope",
    "putain",
    "merde",
    "encule",
    "nique",
    "bite",
    "couille",
    "pede",
    "sucer",
    "branler",
    "chier",
];

const MAX_MESSAGE_LENGTH = 300;
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 30;

export const blockedUsernameTerms = [...RESERVED_NAMES, ...BANNED_TERMS];

type ModerationResult =
    | { allowed: true; sanitized: string }
    | { allowed: false; reason: string; sanitized?: string };

function normalizeText(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s._-]+/g, "")
        .toLowerCase();
}

function containsBlockedTerm(value: string, terms = BANNED_TERMS) {
    const normalized = normalizeText(value);
    return terms.some((term) => normalized.includes(normalizeText(term)));
}

export function sanitizeMessageContent(content: unknown) {
    if (typeof content !== "string") return "";
    return content
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((line) => line.replace(/[ \t\f\v]+/g, " ").trim())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

export function moderateMessage(content: unknown): ModerationResult {
    const sanitized = sanitizeMessageContent(content);

    if (!sanitized) {
        return { allowed: false, reason: "Message vide.", sanitized };
    }

    if (sanitized.length > MAX_MESSAGE_LENGTH) {
        return { allowed: false, reason: "Message trop long.", sanitized };
    }

    if (containsBlockedTerm(sanitized)) {
        return {
            allowed: false,
            reason: "Message refuse par la moderation automatique.",
            sanitized,
        };
    }

    if (/(.)\1{14,}/u.test(sanitized)) {
        return {
            allowed: false,
            reason: "Message refuse pour spam.",
            sanitized,
        };
    }

    return { allowed: true, sanitized };
}

export function moderateUsername(name: unknown): ModerationResult {
    if (typeof name !== "string") {
        return { allowed: false, reason: "Nom d'utilisateur invalide." };
    }

    const sanitized = name.replace(/\s+/g, " ").trim();

    if (
        sanitized.length < MIN_USERNAME_LENGTH ||
        sanitized.length > MAX_USERNAME_LENGTH
    ) {
        return {
            allowed: false,
            reason: "Le nom d'utilisateur doit contenir entre 3 et 30 caracteres.",
        };
    }

    if (!/^[a-zA-Z0-9 _.-]+$/.test(sanitized)) {
        return {
            allowed: false,
            reason: "Le nom d'utilisateur contient des caracteres non autorises.",
        };
    }

    if (containsBlockedTerm(sanitized, blockedUsernameTerms)) {
        return {
            allowed: false,
            reason: "Ce nom d'utilisateur est reserve ou interdit.",
        };
    }

    return { allowed: true, sanitized };
}

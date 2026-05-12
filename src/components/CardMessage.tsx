"use client";

import Message from "@/types/Message";
import { FaTrash } from "react-icons/fa";

export default function CardMessage({
    m,
    userId,
}: {
    m: Message;
    userId: string | undefined;
}) {
    const isOwn = m.userId === userId;

    async function deleteMessage(_id: string, userId: string | undefined) {
        const request = await fetch("/api/messages", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id, userId }),
        });

        if (!request.ok) {
            const data = await request.json();
            console.log(data);
        }
    }

    function handleClick() {
        deleteMessage(m._id, userId);
    }

    return (
        <div
            key={m._id}
            className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}
        >
            <div className="flex max-w-[75%] flex-col gap-1">
                {!isOwn && (
                    <span className="ml-2 text-xs font-medium text-zinc-500">
                        {m.userName}
                    </span>
                )}

                <div
                    className={`relative rounded-2xl px-4 py-3 shadow-sm ${
                        isOwn
                            ? "rounded-br-md bg-blue-500 text-white"
                            : "rounded-bl-md bg-zinc-200 text-black dark:bg-zinc-800 dark:text-white"
                    }`}
                >
                    <p className="break-words text-sm">{m.content}</p>

                    {isOwn && (
                        <button
                            onClick={handleClick}
                            className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow transition hover:scale-110 dark:bg-zinc-900"
                        >
                            <FaTrash size={10} color="red" />
                        </button>
                    )}
                </div>

                <span
                    className={`text-xs text-zinc-400 ${
                        isOwn ? "text-right" : "text-left"
                    }`}
                >
                    {new Date(m.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </span>
            </div>
        </div>
    );
}

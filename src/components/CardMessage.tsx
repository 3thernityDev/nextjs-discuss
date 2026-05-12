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
            className={`flex w-full px-2 ${
                isOwn ? "justify-end" : "justify-start"
            }`}
        >
            <div className="group flex max-w-[80%] flex-col gap-1">
                {!isOwn && (
                    <span className="ml-3 text-xs font-semibold text-zinc-500">
                        {m.userName}
                    </span>
                )}

                <div
                    className={`relative overflow-hidden rounded-3xl px-5 py-3 shadow-md transition-all duration-200 group-hover:shadow-lg ${
                        isOwn
                            ? "rounded-br-md bg-gradient-to-r from-orange-500 to-orange-400 text-white"
                            : "rounded-bl-md border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    }`}
                >
                    {/* Petit effet lumineux */}
                    <div className="pointer-events-none absolute inset-0 opacity-10">
                        <div className="h-full w-full bg-white blur-2xl" />
                    </div>

                    <p className="relative z-10 break-words text-sm leading-relaxed">
                        {m.content}
                    </p>

                    {isOwn && (
                        <button
                            onClick={handleClick}
                            className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-red-500 opacity-0 shadow transition-all duration-200 hover:scale-110 hover:bg-red-50 group-hover:opacity-100 dark:border-zinc-700 dark:bg-zinc-900"
                        >
                            <FaTrash size={10} />
                        </button>
                    )}
                </div>

                <span
                    className={`px-2 text-[11px] text-zinc-400 ${
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

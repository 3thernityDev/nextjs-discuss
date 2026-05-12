"use client";

import { useState } from "react";
import { HiPaperAirplane, HiFaceSmile } from "react-icons/hi2";
import Picker from "emoji-picker-react";

export default function ChatInput() {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!content.trim()) return;

        setLoading(true);

        const request = await fetch("/api/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content }),
        });

        if (request.ok) {
            setContent("");
        }

        setLoading(false);
    }

    function onEmojiClick(emojiData: any) {
        setContent((prev) => prev + emojiData.emoji);
    }

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {/* bouton emoji */}
                <button
                    type="button"
                    onClick={() => setShowEmoji((v) => !v)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                    <HiFaceSmile size={22} />
                </button>

                {/* input */}
                <input
                    type="text"
                    placeholder="Écrivez votre message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-zinc-400 dark:text-white"
                />

                {/* send */}
                <button
                    type="submit"
                    disabled={loading || !content.trim()}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <HiPaperAirplane
                        size={20}
                        className={loading ? "animate-pulse" : ""}
                    />
                </button>
            </div>

            {/* Emoji picker */}
            {showEmoji && (
                <div className="absolute bottom-16 left-0 z-50">
                    <Picker onEmojiClick={onEmojiClick} />
                </div>
            )}
        </form>
    );
}

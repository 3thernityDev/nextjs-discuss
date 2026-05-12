"use client";

import { useRef, useState } from "react";
import { HiFaceSmile, HiPaperAirplane } from "react-icons/hi2";
import { FaPaperclip, FaTimes } from "react-icons/fa";
import Picker, { EmojiClickData } from "emoji-picker-react";
import { toast } from "react-hot-toast";
import { moderateMessage } from "@/lib/moderation";
import Message, { MessageImage } from "@/types/Message";

const MAX_LENGTH = 300;
const MAX_IMAGE_SIZE = 1_000_000;
const QUICK_REACTIONS = ["\u{1F44D}", "\u{1F602}", "\u{1F525}", "\u{2764}\u{FE0F}"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function ChatInput() {
    const [content, setContent] = useState("");
    const [image, setImage] = useState<MessageImage | null>(null);
    const [loading, setLoading] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleSubmit(e?: React.FormEvent<HTMLFormElement>) {
        e?.preventDefault();

        if (!content.trim() && !image) {
            toast.error("Ajoutez un message ou une image.");
            return;
        }

        const moderation = content.trim()
            ? moderateMessage(content)
            : { allowed: true as const, sanitized: "" };

        if (!moderation.allowed) {
            toast.error(moderation.reason);
            return;
        }

        setLoading(true);

        const request = await fetch("/api/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: moderation.sanitized,
                image,
            }),
        });

        if (request.ok) {
            const message = (await request.json()) as Message;
            setContent("");
            setImage(null);
            setShowEmoji(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            window.dispatchEvent(
                new CustomEvent<Message>("messages:new", { detail: message }),
            );
            textareaRef.current?.focus();
        } else {
            const data = await request.json();
            toast.error(data.error ?? "Message refuse.");
        }

        setLoading(false);
    }

    function onEmojiClick(emojiData: EmojiClickData) {
        setContent((prev) => `${prev}${emojiData.emoji}`.slice(0, MAX_LENGTH));
        textareaRef.current?.focus();
    }

    function addQuickReaction(reaction: string) {
        setContent((prev) => `${prev}${reaction}`.slice(0, MAX_LENGTH));
        textareaRef.current?.focus();
    }

    function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            toast.error("Format accepte: JPG, PNG, WebP ou GIF.");
            event.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            toast.error("Image trop lourde. Maximum 1 Mo.");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== "string") {
                toast.error("Image invalide.");
                return;
            }

            setImage({
                dataUrl: reader.result,
                mimeType: file.type as MessageImage["mimeType"],
                name: file.name,
                size: file.size,
            });
        };
        reader.onerror = () => toast.error("Lecture de l'image impossible.");
        reader.readAsDataURL(file);
    }

    function removeImage() {
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className="rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {image && (
                    <div className="mb-2 flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={image.dataUrl}
                            alt={image.name}
                            className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                                {image.name}
                            </p>
                            <p className="text-xs text-zinc-500">
                                {(image.size / 1024).toFixed(0)} Ko
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={removeImage}
                            aria-label="Retirer l'image"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            <FaTimes size={13} />
                        </button>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setShowEmoji((v) => !v)}
                        aria-label="Choisir un emoji"
                        className="mt-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        <HiFaceSmile size={22} />
                    </button>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="Joindre une image"
                        className="mt-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        <FaPaperclip size={18} />
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleImageChange}
                    />

                    <textarea
                        ref={textareaRef}
                        placeholder="Ecrivez votre message..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                if (!loading && (content.trim() || image)) {
                                    void handleSubmit();
                                }
                            }
                        }}
                        className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-sm outline-none placeholder:text-zinc-400 dark:text-white"
                        maxLength={MAX_LENGTH}
                        rows={1}
                    />

                    <button
                        type="submit"
                        aria-label="Envoyer le message"
                        disabled={loading || (!content.trim() && !image)}
                        className="mt-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <HiPaperAirplane
                            size={20}
                            className={loading ? "animate-pulse" : ""}
                        />
                    </button>
                </div>

                <div className="mt-1 flex items-center justify-between gap-3 px-2 pb-1">
                    <div className="flex gap-1">
                        {QUICK_REACTIONS.map((reaction) => (
                            <button
                                key={reaction}
                                type="button"
                                onClick={() => addQuickReaction(reaction)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                aria-label={`Ajouter ${reaction}`}
                            >
                                {reaction}
                            </button>
                        ))}
                    </div>

                    <span
                        className={`text-[11px] ${
                            content.length > MAX_LENGTH - 30
                                ? "text-orange-500"
                                : "text-zinc-400"
                        }`}
                    >
                        {content.length}/{MAX_LENGTH}
                    </span>
                </div>
            </div>

            {showEmoji && (
                <div className="absolute bottom-24 left-0 z-50 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl shadow-xl">
                    <Picker onEmojiClick={onEmojiClick} />
                </div>
            )}
        </form>
    );
}

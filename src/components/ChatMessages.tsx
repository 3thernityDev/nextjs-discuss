"use client";

import { authClient } from "@/lib/auth-client";
import { useCallback, useEffect, useRef, useState } from "react";
import { HiArrowPath } from "react-icons/hi2";
import CardMessage from "./CardMessage";
import Message from "@/types/Message";

export default function ChatMessages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const { data: session } = authClient.useSession();

    const fetchMessages = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError("");

        const request = await fetch("/api/messages", { cache: "no-store" });

        if (!request.ok) {
            setError("Impossible de charger les messages.");
            setLoading(false);
            return;
        }

        const data = (await request.json()) as Message[];
        setMessages(data);
        setLastUpdate(new Date());
        setLoading(false);
    }, []);

    useEffect(() => {
        const initialFetch = window.setTimeout(() => void fetchMessages(), 0);

        const interval = window.setInterval(() => {
            if (document.visibilityState === "visible") void fetchMessages(true);
        }, 5000);

        function handleNewMessage(event: Event) {
            const message = (event as CustomEvent<Message>).detail;
            setMessages((current) => {
                if (current.some((item) => item._id === message._id)) return current;
                return [...current, message].slice(-100);
            });
            setLastUpdate(new Date());
        }

        function handleDeletedMessage(event: Event) {
            const id = (event as CustomEvent<string>).detail;
            setMessages((current) => current.filter((item) => item._id !== id));
            setLastUpdate(new Date());
        }

        function handleUpdatedMessage(event: Event) {
            const message = (event as CustomEvent<Message>).detail;
            setMessages((current) =>
                current.map((item) => (item._id === message._id ? message : item)),
            );
            setLastUpdate(new Date());
        }

        window.addEventListener("messages:new", handleNewMessage);
        window.addEventListener("messages:deleted", handleDeletedMessage);
        window.addEventListener("messages:updated", handleUpdatedMessage);

        function handleFocus() {
            void fetchMessages(true);
        }

        window.addEventListener("focus", handleFocus);

        return () => {
            window.clearTimeout(initialFetch);
            window.clearInterval(interval);
            window.removeEventListener("messages:new", handleNewMessage);
            window.removeEventListener("messages:deleted", handleDeletedMessage);
            window.removeEventListener("messages:updated", handleUpdatedMessage);
            window.removeEventListener("focus", handleFocus);
        };
    }, [fetchMessages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    if (loading) {
        return (
            <div className="flex min-h-[45vh] items-center justify-center text-sm text-zinc-500">
                Chargement des messages...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[45vh] flex-col items-center justify-center gap-3 text-sm text-zinc-500">
                <p>{error}</p>
                <button
                    type="button"
                    onClick={() => void fetchMessages()}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                    <HiArrowPath size={16} />
                    Reessayer
                </button>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="flex min-h-[45vh] flex-col items-center justify-center text-center text-sm text-zinc-500">
                <p className="font-medium text-zinc-700 dark:text-zinc-200">
                    Aucun message pour le moment.
                </p>
                <p className="mt-1">Lancez la conversation.</p>
            </div>
        );
    }

    return (
        <section className="flex flex-1 flex-col gap-3 px-1 py-4 sm:px-4">
            <div className="flex items-center justify-between px-2 text-[11px] text-zinc-400">
                <span>{messages.length} message{messages.length > 1 ? "s" : ""}</span>
                {lastUpdate && (
                    <span>
                        Sync {lastUpdate.toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-3">
                {messages.map((m) => (
                    <CardMessage key={m._id} m={m} userId={session?.user.id} />
                ))}
                <div ref={bottomRef} />
            </div>
        </section>
    );
}

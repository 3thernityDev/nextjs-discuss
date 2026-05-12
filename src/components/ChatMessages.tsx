"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import CardMessage from "./CardMessage";
import Message from "@/types/Message";

export default function ChatMessages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const { data: session } = authClient.useSession();

    useEffect(() => {
        async function fetchMessages() {
            const request = await fetch("/api/messages");

            if (!request.ok) {
                console.log(request.status);
                return;
            }

            const data = await request.json();
            setMessages(data);
        }

        fetchMessages();
    }, []);

    if (messages.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                Aucun message pour le moment.
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto">
            <div className="flex flex-col gap-3">
                {messages.map((m) => (
                    <CardMessage key={m._id} m={m} userId={session?.user.id} />
                ))}
            </div>
        </div>
    );
}

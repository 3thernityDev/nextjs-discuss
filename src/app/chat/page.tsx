"use client";

import ChatInput from "@/components/ChatInput";
import ChatMessages from "@/components/ChatMessages";
import LogoutButton from "@/components/LogoutButton";
import { authClient } from "@/lib/auth-client";

export default function ChatPage() {
    const { data: session } = authClient.useSession();

    return (
        <div className="flex h-screen flex-col bg-zinc-100 dark:bg-zinc-950">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        DiscussLike
                    </h1>

                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Bienvenue {session?.user.name}
                    </p>
                </div>

                <LogoutButton />
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto px-4 py-6">
                <div className="mx-auto flex max-w-4xl flex-col gap-4">
                    <ChatMessages />
                </div>
            </main>

            {/* Input */}
            <footer className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mx-auto max-w-4xl">
                    <ChatInput />
                </div>
            </footer>
        </div>
    );
}

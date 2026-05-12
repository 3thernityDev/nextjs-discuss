"use client";

import { useEffect, useMemo, useState } from "react";
import ChatInput from "@/components/ChatInput";
import ChatMessages from "@/components/ChatMessages";
import LogoutButton from "@/components/LogoutButton";
import { authClient } from "@/lib/auth-client";

export default function ChatPage() {
    const { data: session } = authClient.useSession();
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        function updateOnlineStatus() {
            setIsOnline(navigator.onLine);
        }

        const initial = window.setTimeout(updateOnlineStatus, 0);
        window.addEventListener("online", updateOnlineStatus);
        window.addEventListener("offline", updateOnlineStatus);

        return () => {
            window.clearTimeout(initial);
            window.removeEventListener("online", updateOnlineStatus);
            window.removeEventListener("offline", updateOnlineStatus);
        };
    }, []);

    const userInitial = useMemo(() => {
        return session?.user.name?.trim().charAt(0).toUpperCase() ?? "?";
    }, [session?.user.name]);

    return (
        <div className="flex h-dvh flex-col bg-zinc-100 dark:bg-zinc-950">
            <header className="border-b border-zinc-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95 sm:px-6">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-sm font-bold text-white shadow-sm">
                            {userInitial}
                        </div>

                        <div className="min-w-0">
                            <h1 className="truncate text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
                                DiscussLike
                            </h1>

                            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                                <span className="truncate">
                                    {session?.user.name ?? "Connexion..."}
                                </span>
                                <span
                                    className={`h-2 w-2 rounded-full ${
                                        isOnline ? "bg-emerald-500" : "bg-red-500"
                                    }`}
                                    aria-hidden="true"
                                />
                                <span>{isOnline ? "En ligne" : "Hors ligne"}</span>
                            </div>
                        </div>
                    </div>

                    <LogoutButton />
                </div>
            </header>

            <main className="min-h-0 flex-1 overflow-y-auto px-2 sm:px-4">
                <div className="mx-auto flex min-h-full max-w-5xl flex-col">
                    <ChatMessages />
                </div>
            </main>

            <footer className="border-t border-zinc-200 bg-white/95 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95 sm:p-4">
                <div className="mx-auto max-w-5xl">
                    <ChatInput />
                </div>
            </footer>
        </div>
    );
}

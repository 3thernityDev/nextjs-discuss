"use client";

import Button from "@/components/Button";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    const handleStartChatting = () => {
        router.push("/chat");
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 dark:bg-zinc-950">
            <div className="flex w-full max-w-2xl flex-col items-center rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-6">
                    <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        DiscussLike
                    </h1>

                    <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
                        Une plateforme de discussion moderne, rapide et
                        élégante.
                    </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                    <Button
                        onClick={handleStartChatting}
                        color="orange"
                        type="button"
                    >
                        Commencer à discuter
                    </Button>

                    <button
                        onClick={() => router.push("/login")}
                        className="rounded-xl border border-zinc-300 px-6 py-3 font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        Se connecter
                    </button>
                </div>
            </div>
        </main>
    );
}

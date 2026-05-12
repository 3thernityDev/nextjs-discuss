"use client";

import { useRouter } from "next/navigation";
import {
    FaArrowRight,
    FaBolt,
    FaImage,
    FaLock,
    FaRegComments,
} from "react-icons/fa";

const previewMessages = [
    {
        name: "Nina",
        content: "On partage l'image du prototype ici ?",
        tone: "neutral",
    },
    {
        name: "Sam",
        content: "Oui, et on garde 5 minutes pour corriger un message.",
        tone: "own",
    },
    {
        name: "Mod",
        content: "Message filtre automatiquement avant publication.",
        tone: "system",
    },
];

const highlights = [
    { icon: FaLock, label: "Moderation active" },
    { icon: FaImage, label: "Images securisees" },
    { icon: FaBolt, label: "PWA rapide" },
];

export default function Home() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
            <section className="mx-auto grid min-h-[88vh] max-w-6xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:py-14">
                <div className="max-w-3xl">
                    <div className="mb-8 inline-flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-sm">
                            <FaRegComments size={20} />
                        </span>
                        <span className="text-xl font-black tracking-tight">
                            DiscussLike
                        </span>
                    </div>

                    <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-normal sm:text-6xl lg:text-7xl">
                        Le chat public qui reste propre, rapide et humain.
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
                        Discutez en direct, partagez des images, corrigez vos
                        messages pendant quelques minutes et gardez une
                        moderation automatique cote serveur.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => router.push("/chat")}
                            className="inline-flex items-center justify-center gap-3 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600"
                        >
                            Ouvrir le chat
                            <FaArrowRight size={14} />
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push("/login")}
                            className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-5 py-3 font-semibold text-zinc-800 transition hover:bg-white dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
                        >
                            Se connecter
                        </button>
                    </div>

                    <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                        {highlights.map(({ icon: Icon, label }) => (
                            <div
                                key={label}
                                className="flex items-center gap-3 border-l-2 border-orange-500 py-2 pl-4"
                            >
                                <Icon className="text-orange-500" size={16} />
                                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                        <div>
                            <p className="text-sm font-bold">Salon general</p>
                            <p className="text-xs text-zinc-500">
                                12 membres actifs
                            </p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            En ligne
                        </span>
                    </div>

                    <div className="space-y-4 p-5">
                        <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <div className="h-44 bg-[linear-gradient(135deg,#f97316_0%,#fb923c_45%,#fafafa_45%,#fafafa_100%)] dark:bg-[linear-gradient(135deg,#f97316_0%,#fb923c_45%,#18181b_45%,#18181b_100%)]" />
                            <div className="p-4">
                                <p className="text-sm font-semibold">
                                    Apercu image valide
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Format controle avant publication
                                </p>
                            </div>
                        </div>

                        {previewMessages.map((message) => (
                            <div
                                key={message.content}
                                className={`flex ${
                                    message.tone === "own"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                        message.tone === "own"
                                            ? "rounded-br-md bg-orange-500 text-white"
                                            : message.tone === "system"
                                              ? "border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                                              : "border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                                    }`}
                                >
                                    <p className="mb-1 text-xs font-bold opacity-75">
                                        {message.name}
                                    </p>
                                    <p>{message.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-400 dark:border-zinc-800">
                            Ecrivez votre message...
                            <span className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
                                <FaArrowRight size={13} />
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-t border-zinc-200 bg-white px-5 py-8 dark:border-zinc-800 dark:bg-zinc-900 sm:px-8">
                <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-zinc-600 dark:text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-zinc-900 dark:text-white">
                        Pense pour les salons publics modernes.
                    </p>
                    <p>
                        Moderation serveur, edition limitee, images controlees
                        et installation PWA.
                    </p>
                </div>
            </section>
        </main>
    );
}

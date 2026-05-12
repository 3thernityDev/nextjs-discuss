"use client";

import { useState } from "react";
import { PacmanLoader } from "react-spinners";
import { toast } from "react-hot-toast";
import Button from "@/components/Button";
import { authClient } from "@/lib/auth-client";
import { moderateUsername } from "@/lib/moderation";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const moderation = moderateUsername(name);
        if (!moderation.allowed) {
            toast.error(moderation.reason);
            return;
        }

        if (password.length < 10) {
            toast.error("Le mot de passe doit contenir au moins 10 caracteres.");
            return;
        }

        setLoading(true);

        const { error } = await authClient.signUp.email({
            name: moderation.sanitized,
            email,
            password,
        });

        if (error) {
            console.log(error);
            toast.error(error.message ?? "Inscription impossible.");
        } else {
            setName("");
            setEmail("");
            setPassword("");
            window.location.assign("/chat");
        }

        setLoading(false);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 dark:bg-zinc-950">
            <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                        Creer un compte
                    </h1>

                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        Rejoignez DiscussLike des maintenant
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Nom d'utilisateur"
                        value={name}
                        minLength={3}
                        maxLength={30}
                        autoComplete="username"
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />

                    <input
                        type="email"
                        placeholder="Adresse email"
                        value={email}
                        autoComplete="email"
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />

                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        minLength={10}
                        autoComplete="new-password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />

                    <Button
                        onClick={() => {}}
                        color="orange"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Creation..." : "S'inscrire"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Vous avez deja un compte ?
                    </span>

                    <button
                        onClick={() => router.push("/login")}
                        className="ml-2 text-sm font-medium text-orange-500 transition hover:underline"
                    >
                        Connectez-vous
                    </button>
                </div>

                {loading && (
                    <div className="mt-6 flex justify-center">
                        <PacmanLoader color="#f97316" size={12} />
                    </div>
                )}
            </div>
        </div>
    );
}

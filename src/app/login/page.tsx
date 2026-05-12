"use client";

import Button from "@/components/Button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PacmanLoader } from "react-spinners";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const { error } = await authClient.signIn.email({
            email,
            password,
        });

        if (error) {
            console.log(error);
            toast.error("Identifiants invalides.");
            setLoading(false);
        } else {
            router.push("/chat");
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 dark:bg-zinc-950">
            <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                        Connexion
                    </h1>

                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        Connectez-vous a votre compte DiscussLike
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />

                    <Button
                        onClick={() => {}}
                        color="orange"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Connexion..." : "Se connecter"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Vous n&apos;avez pas encore de compte ?
                    </span>

                    <button
                        onClick={() => router.push("/register")}
                        className="ml-2 text-sm font-medium text-orange-500 transition hover:underline"
                    >
                        S&apos;inscrire
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

"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { PacmanLoader } from "react-spinners";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setLoading(true);

        const { error } = await authClient.signUp.email({
            name,
            email,
            password,
        });

        if (error) {
            console.log(error);
        } else {
            setName("");
            setEmail("");
            setPassword("");

            router.push("/chat");
        }

        setLoading(false);
    }

    const handleLogin = () => {
        router.push("/login");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 dark:bg-zinc-950">
            <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                        Créer un compte
                    </h1>

                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        Rejoignez DiscussLike dès maintenant
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Nom d'utilisateur"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />

                    <input
                        type="email"
                        placeholder="Adresse email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />

                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />

                    <Button
                        onClick={() => {}}
                        color="orange"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Création..." : "S'inscrire"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Vous avez déjà un compte ?
                    </span>

                    <button
                        onClick={handleLogin}
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

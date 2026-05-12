"use client";

import Button from "@/components/Button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PacmanLoader } from "react-spinners";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        const { error } = await authClient.signIn.email({ email, password });
        if (error) {
            console.log(error);
            setLoading(false);
        } else {
            router.push("/chat");
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center justify-center h-screen gap-4"
        >
            <input
                type="text"
                placeholder="email"
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 w-64"
            />
            <input
                type="password"
                placeholder="password"
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 w-64"
            />
            <Button
                onClick={() => {}}
                color="orange"
                type="submit"
                disabled={loading}
            >
                Se connecter
            </Button>
            {loading && <PacmanLoader color="#36d7b7" />}
        </form>
    );
}

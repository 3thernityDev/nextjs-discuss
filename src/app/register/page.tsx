"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { PacmanLoader } from "react-spinners";
import Button from "@/components/Button";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.SubmitEvent) {
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
            e.target.reset();
        }
        setLoading(false);
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center justify-center h-screen gap-4"
        >
            <input
                type="text"
                placeholder="name"
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 w-64"
            />
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
                S&apos;inscrire
            </Button>
            {loading && <PacmanLoader color="#36d7b7" />}
        </form>
    );
}

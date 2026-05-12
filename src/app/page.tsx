"use client";

import Button from "@/components/Button";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    const handleStartChatting = () => {
        router.push("/chat");
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-6">
            <h1 className="text-3xl font-semibold">
                Bienvenue sur DiscussLike !
            </h1>

            <Button onClick={handleStartChatting} color="orange">
                Commencer a discuter
            </Button>
        </div>
    );
}

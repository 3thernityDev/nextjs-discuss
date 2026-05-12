"use client";

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

            <button
                onClick={handleStartChatting}
                className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 cursor-pointer"
            >
                Commencer à discuter
            </button>
        </div>
    );
}

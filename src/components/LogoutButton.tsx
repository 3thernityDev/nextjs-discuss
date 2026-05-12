"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { FaSignOutAlt } from "react-icons/fa";

export default function LogoutButton() {
    const router = useRouter();

    async function handleSignOut() {
        await authClient.signOut();
        router.push("/login");
    }

    return (
        <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-600 active:scale-95"
        >
            <FaSignOutAlt size={14} />
            Déconnexion
        </button>
    );
}

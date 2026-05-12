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
            className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-600"
        >
            <FaSignOutAlt color="white" />
        </button>
    );
}

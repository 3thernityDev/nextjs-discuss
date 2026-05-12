import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import AppProviders from "@/components/AppProviders";

export const metadata: Metadata = {
    title: "DiscussLike",
    description: "Chat public avec moderation, images et edition courte des messages.",
    manifest: "/manifest.webmanifest",
    applicationName: "DiscussLike",
    appleWebApp: {
        capable: true,
        title: "DiscussLike",
        statusBarStyle: "default",
    },
};

export const viewport: Viewport = {
    themeColor: "#f97316",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" className="h-full antialiased">
            <body className="min-h-full flex flex-col">
                {children}
                <AppProviders />
                <Analytics />
            </body>
        </html>
    );
}

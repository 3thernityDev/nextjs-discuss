"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if (!("serviceWorker" in navigator)) return;

        function registerServiceWorker() {
            navigator.serviceWorker.register("/sw.js").then((registration) => {
                registration.update().catch(() => {});
            }).catch((error) => {
                console.warn("Service worker registration failed", error);
            });
        }

        if (document.readyState === "complete") {
            registerServiceWorker();
            return;
        }

        window.addEventListener("load", registerServiceWorker);

        return () => {
            window.removeEventListener("load", registerServiceWorker);
        };
    }, []);

    return null;
}

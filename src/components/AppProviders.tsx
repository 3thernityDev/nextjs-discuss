"use client";

import { Toaster } from "react-hot-toast";
import ServiceWorkerRegister from "./ServiceWorkerRegister";

export default function AppProviders() {
    return (
        <>
            <Toaster position="top-center" />
            <ServiceWorkerRegister />
        </>
    );
}

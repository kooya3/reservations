"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Dashboard error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
                <p className="text-neutral-400 mb-6">
                    {error.message || "Failed to load dashboard"}
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/pos"
                        className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Back to POS
                    </Link>
                </div>
            </div>
        </div>
    );
}

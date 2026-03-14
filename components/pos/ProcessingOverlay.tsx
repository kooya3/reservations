"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

interface ProcessingOverlayProps {
    isVisible: boolean;
    status?: "processing" | "generating" | "complete";
}

export function ProcessingOverlay({ isVisible, status = "processing" }: ProcessingOverlayProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setMounted(true);
        } else {
            const timer = setTimeout(() => setMounted(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    if (!mounted && !isVisible) return null;

    const statusMessages = {
        processing: "Processing Payment...",
        generating: "Generating Receipt...",
        complete: "Complete!"
    };

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"
                }`}
            style={{ pointerEvents: isVisible ? "all" : "none" }}
        >
            <div className="flex flex-col items-center gap-6 animate-fade-in">
                {/* Animated Spinner */}
                <div className="relative">
                    {status === "complete" ? (
                        <div className="animate-scale-bounce">
                            <CheckCircle2 className="w-20 h-20 text-emerald-500" />
                        </div>
                    ) : (
                        <>
                            {/* Outer ring */}
                            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 w-20 h-20" />
                            {/* Spinning gradient ring */}
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-400 w-20 h-20 animate-spin" />
                            {/* Inner icon */}
                            <div className="flex items-center justify-center w-20 h-20">
                                <Loader2 className="w-10 h-10 text-emerald-500 animate-pulse" />
                            </div>
                        </>
                    )}
                </div>

                {/* Status Text */}
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white animate-pulse">
                        {statusMessages[status]}
                    </h3>
                    <p className="text-sm text-neutral-400">
                        Please wait, this will only take a moment
                    </p>
                </div>

                {/* Progress dots */}
                {status !== "complete" && (
                    <div className="flex gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                )}
            </div>
        </div>
    );
}

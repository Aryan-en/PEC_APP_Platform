"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useState, useEffect } from "react";

// Initialize accent color from localStorage on page load
const initAccentColor = () => {
    if (typeof window === 'undefined') return;
    const accent = localStorage.getItem('accent-color') || 'sapphire';
    const root = document.documentElement;
    // Remove all existing accent classes
    root.classList.remove('accent-obsidian', 'accent-emerald', 'accent-sapphire', 'accent-amethyst', 'accent-coral');
    root.classList.add(`accent-${accent}`);

    // Cleanup legacy inline styles from old theme picker
    root.removeAttribute('style');
};

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        initAccentColor();
        setMounted(true);
    }, []);

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    {children}
                    {mounted && <Toaster />}
                    {mounted && <Sonner />}
                </TooltipProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}

"use client";

import { useLanguage, Language } from "@/lib/i18n";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
    variant?: "icon" | "full";
    className?: string;
}

export function LanguageToggle({ variant = "icon", className = "" }: LanguageToggleProps) {
    const { language, setLanguage, toggleLanguage } = useLanguage();

    if (variant === "icon") {
        return (
            <button
                onClick={toggleLanguage}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${className}`}
                aria-label="Toggle language"
                title={language === "en" ? "বাংলায় দেখুন" : "View in English"}
            >
                <Globe className="w-4 h-4 text-neutral-500" />
                <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300 uppercase">
                    {language === "en" ? "বাং" : "EN"}
                </span>
            </button>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <button
                onClick={() => setLanguage("en")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${language === "en"
                        ? "bg-red-600 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
            >
                English
            </button>
            <button
                onClick={() => setLanguage("bn")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${language === "bn"
                        ? "bg-red-600 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
            >
                বাংলা
            </button>
        </div>
    );
}

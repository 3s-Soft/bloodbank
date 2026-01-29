"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { en, Translations } from "./en";
import { bn } from "./bn";

type Language = "en" | "bn";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
    toggleLanguage: () => void;
}

const translations: Record<Language, Translations> = { en, bn };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("language") as Language | null;
        if (saved && (saved === "en" || saved === "bn")) {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("language", lang);
        document.documentElement.lang = lang;
    }, []);

    const toggleLanguage = useCallback(() => {
        const newLang = language === "en" ? "bn" : "en";
        setLanguage(newLang);
    }, [language, setLanguage]);

    const t = translations[language];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}

export { en, bn };
export type { Language, Translations };

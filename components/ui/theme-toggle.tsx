"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/lib/context/ThemeContext";
import { useState, useRef, useEffect } from "react";

interface ThemeToggleProps {
    variant?: "icon" | "dropdown";
    className?: string;
}

export function ThemeToggle({ variant = "icon", className = "" }: ThemeToggleProps) {
    const { theme, actualTheme, setTheme, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (variant === "icon") {
        return (
            <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${className}`}
                aria-label="Toggle theme"
            >
                {actualTheme === "dark" ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                    <Moon className="w-5 h-5 text-neutral-600" />
                )}
            </button>
        );
    }

    const themeOptions = [
        { value: "light", label: "Light", icon: Sun },
        { value: "dark", label: "Dark", icon: Moon },
        { value: "system", label: "System", icon: Monitor },
    ];

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
                {actualTheme === "dark" ? (
                    <Moon className="w-5 h-5 text-neutral-400" />
                ) : (
                    <Sun className="w-5 h-5 text-yellow-500" />
                )}
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize">
                    {theme}
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl overflow-hidden z-50">
                    {themeOptions.map((opt) => {
                        const Icon = opt.icon;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    setTheme(opt.value as any);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${theme === opt.value
                                        ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

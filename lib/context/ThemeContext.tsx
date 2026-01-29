"use client";

import { createContext, useContext, ReactNode } from "react";

type Theme = "dark";

interface ThemeContextType {
    theme: Theme;
    actualTheme: "dark";
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Bangladesh Bloodbank uses a unified professional dark theme.
    // Switching is disabled to maintain a premium, consistent visual identity.

    return (
        <ThemeContext.Provider value={{
            theme: "dark",
            actualTheme: "dark",
            setTheme: () => { },
            toggleTheme: () => { }
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

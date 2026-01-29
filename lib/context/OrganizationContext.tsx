"use client";

import { createContext, useContext, ReactNode } from "react";

interface OrganizationData {
    name: string;
    slug: string;
    logo?: string;
    primaryColor?: string;
    contactEmail?: string;
}

const OrganizationContext = createContext<OrganizationData | null>(null);

export function OrganizationProvider({
    children,
    value
}: {
    children: ReactNode;
    value: OrganizationData
}) {
    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization() {
    const context = useContext(OrganizationContext);
    if (context === null || context === undefined) {
        throw new Error("useOrganization must be used within an OrganizationProvider");
    }
    return context;
}

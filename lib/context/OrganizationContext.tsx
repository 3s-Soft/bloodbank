"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Branding and identity for the organization behind the current `[orgSlug]`
 * route. Provided by `app/[orgSlug]/layout.tsx`, which has already resolved and
 * validated the slug server-side.
 */
export interface OrganizationData {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    primaryColor: string;
    contactEmail: string | null;
    contactPhone: string | null;
    address: string | null;
    isVerified: boolean;
}

const OrganizationContext = createContext<OrganizationData | null>(null);

export function OrganizationProvider({
    children,
    value,
}: {
    children: ReactNode;
    value: OrganizationData;
}) {
    return (
        <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
    );
}

export function useOrganization() {
    const context = useContext(OrganizationContext);
    if (!context) {
        throw new Error("useOrganization must be used within an OrganizationProvider");
    }
    return context;
}

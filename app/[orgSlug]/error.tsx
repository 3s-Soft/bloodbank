"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Droplet, Home, RotateCcw, Users } from "lucide-react";

import { ErrorSurface } from "@/components/ErrorSurface";
import { reportClientError } from "@/lib/reportClientError";

/**
 * Error boundary for an organization's pages.
 *
 * The slug is read from the pathname rather than `useOrganization()`: the
 * failure may well be the layout that provides that context.
 */
export default function OrgError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const pathname = usePathname();
    const slug = pathname.split("/").filter(Boolean)[0] ?? "";

    useEffect(() => {
        reportClientError("Organization page error", error);
    }, [error]);

    return (
        <ErrorSurface
            code="500"
            title="This page could not be loaded."
            description="The fault is on our side. Trying again often works, and the pages below are unaffected."
            actions={[
                {
                    href: `/${slug}/donors`,
                    label: "Find donors",
                    hint: "Search by blood group and area",
                    icon: Users,
                    primary: true,
                },
                {
                    href: `/${slug}/requests`,
                    label: "Blood requests",
                    hint: "See what is currently needed",
                    icon: Droplet,
                },
                {
                    href: `/${slug}`,
                    label: "Organization home",
                    hint: "Back to the main page",
                    icon: Home,
                },
            ]}
        >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    Try again
                </button>

                {error.digest ? (
                    <p className="font-mono text-xs text-slate-600">Reference {error.digest}</p>
                ) : null}
            </div>
        </ErrorSurface>
    );
}

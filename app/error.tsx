"use client";

import { useEffect } from "react";
import { Building2, Home, RotateCcw } from "lucide-react";

import { ErrorSurface } from "@/components/ErrorSurface";
import { reportClientError } from "@/lib/reportClientError";

/**
 * Route-level error boundary.
 *
 * `error.tsx` must be a client component: Next.js passes it the error and a
 * `reset` callback to re-render the segment.
 */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        reportClientError("Unhandled application error", error);
    }, [error]);

    return (
        <ErrorSurface
            code="500"
            title="Something on our side broke."
            description="The page could not be loaded. Trying again often works; if it does not, the routes below are unaffected."
            actions={[
                {
                    href: "/",
                    label: "Home",
                    hint: "Find a blood bank near you",
                    icon: Home,
                    primary: true,
                },
                {
                    href: "/#organizations",
                    label: "Browse organizations",
                    hint: "Every verified blood bank on the platform",
                    icon: Building2,
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

                {/* The digest is the only handle support has on a specific failure. */}
                {error.digest ? (
                    <p className="font-mono text-xs text-slate-600">
                        Reference {error.digest}
                    </p>
                ) : null}
            </div>
        </ErrorSurface>
    );
}

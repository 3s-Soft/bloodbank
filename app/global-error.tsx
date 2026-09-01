"use client";

import { useEffect } from "react";

// A dependency-free helper, safe to import even though the layout has failed.
import { reportClientError } from "@/lib/reportClientError";

/**
 * Last-resort boundary, for failures in the root layout itself.
 *
 * This replaces the whole document, so it must render its own <html> and
 * <body>, and it cannot rely on the app's providers, fonts or global CSS --
 * all of which live in the layout that just failed. Everything here is
 * therefore inline and self-contained.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        reportClientError("Root layout error", error);
    }, [error]);

    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#020617",
                    color: "#f8fafc",
                    fontFamily:
                        "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                    padding: "2rem 1.5rem",
                }}
            >
                <main style={{ width: "100%", maxWidth: "36rem", margin: "0 auto" }}>
                    <p
                        style={{
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                            fontSize: "0.75rem",
                            letterSpacing: "0.35em",
                            textTransform: "uppercase",
                            color: "#dc2626",
                            margin: "0 0 1.5rem",
                        }}
                    >
                        Error 500
                    </p>

                    <h1
                        style={{
                            fontSize: "2.25rem",
                            lineHeight: 1.05,
                            fontWeight: 900,
                            letterSpacing: "-0.02em",
                            margin: 0,
                        }}
                    >
                        The application failed to start.
                    </h1>

                    <p
                        style={{
                            marginTop: "1rem",
                            color: "#94a3b8",
                            lineHeight: 1.6,
                        }}
                    >
                        This is a fault on our side, not something you did. Reloading usually
                        clears it.
                    </p>

                    {/* The interrupted trace, inlined: global CSS is unavailable here. */}
                    <svg
                        viewBox="0 0 640 80"
                        style={{ width: "100%", height: "4rem", margin: "2.5rem 0" }}
                        aria-hidden="true"
                    >
                        <path
                            d="M0 40 H90 l14 0 8 -22 10 44 9 -22 h64 l12 0 7 -12 6 24 5 -12 H300"
                            fill="none"
                            stroke="#dc2626"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <circle cx="320" cy="40" r="3" fill="#dc2626" />
                        <path
                            d="M340 40 H420 l10 0 7 -16 8 32 6 -16 h58 l14 0 6 -10 6 20 5 -10 H640"
                            fill="none"
                            stroke="#dc2626"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.28"
                        />
                    </svg>

                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                        <button
                            type="button"
                            onClick={reset}
                            style={{
                                height: "3rem",
                                padding: "0 1.5rem",
                                borderRadius: "0.75rem",
                                border: "none",
                                backgroundColor: "#dc2626",
                                color: "#ffffff",
                                fontWeight: 700,
                                fontSize: "1rem",
                                cursor: "pointer",
                            }}
                        >
                            Reload the page
                        </button>

                        {error.digest ? (
                            <p
                                style={{
                                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                                    fontSize: "0.75rem",
                                    color: "#475569",
                                    margin: 0,
                                }}
                            >
                                Reference {error.digest}
                            </p>
                        ) : null}
                    </div>
                </main>
            </body>
        </html>
    );
}

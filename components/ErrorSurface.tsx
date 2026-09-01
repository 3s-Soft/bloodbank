import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

/**
 * The shared surface behind every error and not-found page.
 *
 * Someone reaching one of these may be looking for blood right now, so the page
 * is built to route rather than to apologise: the status code is demoted to a
 * small diagnostic eyebrow, and the destinations that still work are the
 * largest thing on the screen.
 */

export interface ErrorAction {
    href: string;
    label: string;
    hint: string;
    icon: LucideIcon;
    /** The one action most likely to be what the person came for. */
    primary?: boolean;
}

interface ErrorSurfaceProps {
    /** Shown as a diagnostic eyebrow, e.g. "404" or "500". */
    code: string;
    /** What happened, in the interface's voice. Never an apology. */
    title: string;
    description: string;
    actions: ErrorAction[];
    /** Tenant colour when the failure happened inside an organization. */
    accent?: string;
    /** Rendered under the actions, e.g. a retry button or a reference id. */
    children?: React.ReactNode;
}

/**
 * An interrupted pulse trace.
 *
 * Deliberately not a flatline: on a service about saving lives, a flatline
 * signals death. This one breaks and resumes, which is what actually happened
 * to the request.
 */
function InterruptedPulse({ accent }: { accent: string }) {
    return (
        <svg
            viewBox="0 0 640 80"
            className="w-full h-16 overflow-visible"
            role="presentation"
            aria-hidden="true"
        >
            {/* Trace before the break. */}
            <path
                d="M0 40 H90 l14 0 8 -22 10 44 9 -22 h64 l12 0 7 -12 6 24 5 -12 H300"
                fill="none"
                stroke={accent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pulse-trace"
            />
            {/* The break itself. */}
            <circle cx="320" cy="40" r="3" fill={accent} className="pulse-break" />
            {/* Trace after the break, dimmed: the service continues. */}
            <path
                d="M340 40 H420 l10 0 7 -16 8 32 6 -16 h58 l14 0 6 -10 6 20 5 -10 H640"
                fill="none"
                stroke={accent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.28"
                className="pulse-trace pulse-trace-resumed"
            />
        </svg>
    );
}

export function ErrorSurface({
    code,
    title,
    description,
    actions,
    accent = "#dc2626",
    children,
}: ErrorSurfaceProps) {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center px-6 py-16">
            <div className="w-full max-w-2xl mx-auto">
                {/* The code is metadata, so it is sized like metadata. */}
                <p
                    className="font-mono text-xs tracking-[0.35em] uppercase mb-6"
                    style={{ color: accent }}
                >
                    Error {code}
                </p>

                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.05] text-white text-balance">
                    {title}
                </h1>

                <p className="mt-4 text-slate-400 leading-relaxed max-w-xl">{description}</p>

                <div className="my-10" aria-hidden="true">
                    <InterruptedPulse accent={accent} />
                </div>

                <nav aria-label="Where to go next">
                    <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-slate-600 mb-3">
                        Still available
                    </p>

                    <ul className="border-t border-slate-800">
                        {actions.map((action) => (
                            <li key={action.href} className="border-b border-slate-800">
                                <Link
                                    href={action.href}
                                    className="group flex items-center gap-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-sm"
                                    style={
                                        {
                                            "--tw-ring-color": accent,
                                        } as React.CSSProperties
                                    }
                                >
                                    <span
                                        className="shrink-0 grid place-items-center w-10 h-10 rounded-xl border border-slate-800 bg-slate-900 transition-colors group-hover:border-slate-700"
                                        style={action.primary ? { borderColor: accent } : undefined}
                                    >
                                        <action.icon
                                            className="w-4 h-4"
                                            style={{ color: action.primary ? accent : undefined }}
                                            aria-hidden="true"
                                        />
                                    </span>

                                    <span className="min-w-0 flex-1">
                                        <span className="block font-semibold text-white">
                                            {action.label}
                                        </span>
                                        <span className="block text-sm text-slate-500 truncate">
                                            {action.hint}
                                        </span>
                                    </span>

                                    <ArrowRight
                                        className="w-4 h-4 text-slate-600 shrink-0 transition-transform group-hover:translate-x-1"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {children ? <div className="mt-8">{children}</div> : null}
            </div>
        </main>
    );
}

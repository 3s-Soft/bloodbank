import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

import { BRAND } from "@/lib/config/brand";

export interface LegalSection {
    heading: string;
    /** Paragraphs. Each renders as its own <p>. */
    body: string[];
    /** Optional bullet list, rendered after the paragraphs. */
    bullets?: string[];
}

/**
 * The shell every platform policy page renders into.
 *
 * Five pages with the same header, the same "last updated" line and the same
 * back link is five chances for them to drift apart; the one that drifts is
 * always the one somebody actually reads.
 */
export default function LegalPage({
    title,
    intro,
    sections,
    footNote,
    eyebrow = "Legal & Compliance",
    links,
}: {
    title: string;
    intro: string;
    sections: LegalSection[];
    footNote?: string;
    /** Kicker above the title. The About and Contact pages are not legal text. */
    eyebrow?: string;
    /** Rendered as cards under the intro. Used by the contact page. */
    links?: Array<{ label: string; href: string; description: string }>;
}) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <header className="border-b border-white/5 bg-slate-900/50">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between max-w-4xl">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden">
                            <Image
                                src="/assets/logo-mark.png"
                                alt={`${BRAND.name} logo`}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-lg font-black text-white tracking-tight">
                            Bangladesh <span className="text-red-500">Blood</span>
                            <span className="text-emerald-500"> Bank</span>
                        </span>
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to site
                    </Link>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-16 md:py-24 max-w-4xl">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                    {eyebrow}
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-white mt-6 mb-6 tracking-tight">
                    {title}
                </h1>
                <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                    {intro}
                </p>
                <p className="mt-6 text-xs font-bold uppercase tracking-widest text-slate-600">
                    Last updated {BRAND.policiesUpdated}
                </p>

                {links && (
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="rounded-2xl border border-white/5 bg-slate-900/50 p-6 hover:bg-slate-900 hover:border-red-500/20 transition-all"
                            >
                                <span className="block text-white font-black tracking-tight">
                                    {link.label}
                                </span>
                                <span className="block mt-2 text-sm text-slate-500 font-medium leading-relaxed">
                                    {link.description}
                                </span>
                            </a>
                        ))}
                    </div>
                )}

                <div className="mt-16 space-y-12">
                    {sections.map((section) => (
                        <section key={section.heading}>
                            <h2 className="text-2xl md:text-3xl font-black text-white mb-5 tracking-tight">
                                {section.heading}
                            </h2>
                            <div className="space-y-4">
                                {section.body.map((paragraph) => (
                                    <p
                                        key={paragraph.slice(0, 40)}
                                        className="text-slate-400 leading-relaxed font-medium"
                                    >
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                            {section.bullets && (
                                <ul className="mt-5 space-y-3">
                                    {section.bullets.map((bullet) => (
                                        <li
                                            key={bullet.slice(0, 40)}
                                            className="flex gap-3 text-slate-400 leading-relaxed font-medium"
                                        >
                                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                            <span>{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}
                </div>

                {footNote && (
                    <p className="mt-16 pt-8 border-t border-white/5 text-sm text-slate-500 leading-relaxed font-medium">
                        {footNote}
                    </p>
                )}
            </main>
        </div>
    );
}

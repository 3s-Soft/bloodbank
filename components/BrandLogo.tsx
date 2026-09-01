import Image from "next/image";

import { BRAND } from "@/lib/config/brand";

/**
 * The platform logo lockup: the mark, optionally followed by the wordmark.
 *
 * Every header and footer used to draw its own — a gradient `div` with a
 * lucide droplet in it, plus the word "BloodBank" in two colours — which is why
 * replacing the placeholder artwork left four navigation bars still showing the
 * old icon. One component, so the next change lands everywhere at once.
 *
 * The mark is the emblem cropped out of the full lockup (see `brand/README.md`);
 * the wordmark is rendered as live text rather than baked into the image so it
 * stays sharp, selectable and readable to a screen reader.
 */

const SIZES = {
    sm: { box: "w-8 h-8", px: 32, text: "text-base" },
    md: { box: "w-9 h-9", px: 36, text: "text-xl" },
    lg: { box: "w-10 h-10", px: 40, text: "text-lg" },
} as const;

export default function BrandLogo({
    size = "md",
    wordmark = true,
    /** Rendered under the wordmark. Used by the admin panel and the docs. */
    suffix,
    priority = false,
    className = "",
}: {
    size?: keyof typeof SIZES;
    wordmark?: boolean;
    suffix?: string;
    priority?: boolean;
    className?: string;
}) {
    const { box, px, text } = SIZES[size];

    return (
        <span className={`flex items-center gap-2.5 ${className}`}>
            <span className={`relative ${box} rounded-xl overflow-hidden shrink-0`}>
                <Image
                    src="/assets/logo-mark.png"
                    alt={wordmark ? "" : `${BRAND.name} logo`}
                    width={px}
                    height={px}
                    priority={priority}
                    className="w-full h-full object-cover"
                />
            </span>
            {wordmark && (
                <span className={`${text} font-black text-white tracking-tight whitespace-nowrap`}>
                    Bangladesh <span className="text-red-500">Blood</span>
                    <span className="text-emerald-500"> Bank</span>
                    {suffix && (
                        <span className="text-slate-400 text-sm font-bold ml-2">{suffix}</span>
                    )}
                </span>
            )}
        </span>
    );
}

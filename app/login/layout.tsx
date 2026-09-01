import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

/**
 * Sign-in has no search value and every route behind it is private, so it is
 * kept out of the index. `follow` stays on: the links back to the public site
 * should still count.
 */
export const metadata: Metadata = buildMetadata({
    title: "Sign in",
    description: "Sign in to manage your blood bank, donors and blood requests.",
    path: "/login",
    noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return children;
}

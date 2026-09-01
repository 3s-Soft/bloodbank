import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const pwaConfig = withPWA({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    workboxOptions: {
        skipWaiting: true,
    },
});

/**
 * Security headers.
 *
 * The Content-Security-Policy allows what this app actually loads: Google Fonts
 * (next/font), Firebase Cloud Messaging endpoints, and Google's OAuth domains
 * for NextAuth sign-in. `'unsafe-inline'` and `'unsafe-eval'` are required by
 * the Next.js runtime and its inlined bootstrap script; removing them needs
 * nonce-based CSP, which is a larger change than this pass.
 */
const CSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://fcmregistrations.googleapis.com https://fcm.googleapis.com https://firebaseinstallations.googleapis.com https://www.googleapis.com https://securetoken.googleapis.com",
    "frame-src 'self' https://accounts.google.com",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
    { key: "Content-Security-Policy", value: CSP },
    // Clickjacking protection, alongside frame-ancestors above.
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // The app needs none of these; denying them limits the blast radius of any
    // injected script.
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
];

const nextConfig: NextConfig = {
    output: "standalone",
    serverExternalPackages: ["firebase-admin", "@opentelemetry/api"],
    turbopack: {},
    images: {
        formats: ["image/avif", "image/webp"],
    },
    compress: true,
    // Error detail belongs in server logs, not in responses to clients.
    poweredByHeader: false,
    async headers() {
        return [
            {
                source: "/:path*",
                headers: securityHeaders,
            },
            {
                // Donor and request data is tenant-scoped and must never be
                // cached by a shared proxy or CDN.
                source: "/api/:path*",
                headers: [
                    { key: "Cache-Control", value: "no-store, must-revalidate" },
                ],
            },
        ];
    },
};

export default pwaConfig(nextConfig);

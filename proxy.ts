import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Protection for Super Admin routes
        if (path.startsWith("/admin")) {
            if (token?.role !== "super_admin") {
                return NextResponse.redirect(new URL("/login", req.url));
            }
        }

        // Protection for Organization Dashboard routes
        // This matches /any-org-slug/dashboard and /any-org-slug/dashboard/anything
        const dashboardRegex = /^\/[^\/]+\/dashboard(\/.*)?$/;
        if (dashboardRegex.test(path)) {
            // Only super_admin or admin can access dashboard routes
            // `withAuth` already ensures the user is logged in
            if (token?.role !== "admin" && token?.role !== "super_admin") {
                // If a donor or patient tries to access the dashboard, kick them to the public org page
                const orgSlug = path.split('/')[1];
                return NextResponse.redirect(new URL(`/${orgSlug}`, req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            // This ensures the middleware function is only called if a token exists for the matched routes.
            // If there's no token, they are automatically redirected to the signIn page (/login).
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        }
    }
);

export const config = {
    // Apply middleware to all admin and dashboard routes
    matcher: [
        "/admin/:path*",
        "/:orgSlug/dashboard/:path*"
    ],
};

import Link from "next/link";
import { Droplet } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Admin Navbar */}
            <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-neutral-900">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/admin" className="flex items-center space-x-2 group">
                        <div className="bg-red-600 p-1.5 rounded-lg">
                            <Droplet className="w-6 h-6 text-white fill-current" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">
                            Blood<span className="text-red-500">Bank</span>
                            <span className="text-neutral-400 text-sm ml-2">Admin</span>
                        </span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        <Link
                            href="/admin"
                            className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/admin/organizations"
                            className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                        >
                            Organizations
                        </Link>
                        <Link
                            href="/"
                            className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                        >
                            ← Back to Site
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Admin Footer */}
            <footer className="border-t border-neutral-200 bg-white py-6">
                <div className="container mx-auto px-4 text-center text-sm text-neutral-500">
                    Rural Blood Bank Super Admin Panel © {new Date().getFullYear()}
                </div>
            </footer>
        </div>
    );
}

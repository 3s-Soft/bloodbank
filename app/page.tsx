"use client";

import { Droplet, Heart, Users, Search, ArrowRight, Shield, Clock, MapPin, LogOut, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

interface Organization {
  _id: string;
  name: string;
  slug: string;
  primaryColor: string;
  isActive: boolean;
  isVerified: boolean;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await fetch("/api/organizations");
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          setOrganizations(data);
        } else {
          console.error("Fetch organizations failed:", data.error || "Unknown error");
          setOrganizations([]);
        }
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
      } finally {
        setLoadingOrgs(false);
      }
    };
    fetchOrganizations();
  }, []);

  const features = [
    { icon: Search, title: "Find Donors Fast", desc: "Search by blood group, district, and upazila to find available donors instantly." },
    { icon: Shield, title: "Verified Network", desc: "All donors are verified by local volunteers to ensure reliability." },
    { icon: Clock, title: "24/7 Availability", desc: "Post requests anytime. Our platform works around the clock." },
    { icon: MapPin, title: "Hyperlocal Focus", desc: "Designed specifically for rural communities where every minute counts." },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-red-500/10 p-1.5 rounded-lg group-hover:bg-red-500/20 transition-colors border border-red-500/20">
              <Droplet className="w-6 h-6 fill-current text-red-500" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Blood<span className="text-red-500">Bank</span>
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="w-24 h-10 bg-slate-800 rounded-xl animate-pulse" />
            ) : status === "authenticated" && session?.user ? (
              <>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{session.user.name || session.user.email}</span>
                </div>
                {(session.user as any).role === "super_admin" && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex items-center justify-center h-10 px-4 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 hover:border-slate-600 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="#organizations"
                  className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/30"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-red-500/10 rounded-full mb-6 border border-red-500/20">
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                Community-Powered Blood Donation
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              Every Drop of Blood <span className="text-red-500">Saves a Life.</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl">
              We connect blood donors with patients in rural areas of Bangladesh, quickly and free of charge. Join your local community blood bank today.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="#organizations"
                className="inline-flex items-center justify-center h-14 px-8 rounded-xl bg-red-600 text-white text-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/30"
              >
                <Droplet className="w-5 h-5 mr-2" />
                Find a Blood Bank
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center h-14 px-8 rounded-xl border-2 border-slate-700 text-white text-lg font-semibold hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
              >
                Learn How It Works
              </Link>
            </div>
          </div>
        </div>
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-slate-950 to-slate-950 -z-10" />
        <div className="absolute bottom-0 right-20 hidden lg:block opacity-5">
          <Droplet className="w-96 h-96 text-red-500" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "750+", label: "Registered Donors" },
              { value: "3,500+", label: "Lives Saved" },
              { value: "45+", label: "Villages Covered" },
              { value: "24/7", label: "Support Available" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-black text-red-500 mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">How It Works</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Our platform is designed for simplicity and speed, helping you find or provide blood when it matters most.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-slate-900/50 hover:bg-slate-800/50 transition-colors group border border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20 group-hover:border-red-500/50 transition-colors">
                  <feature.icon className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organizations Section */}
      <section id="organizations" className="py-24 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Join Your Local Blood Bank</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Select your community's blood bank to register as a donor or search for available donors.
            </p>
          </div>

          {loadingOrgs ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          ) : organizations.length === 0 ? (
            <div className="text-center py-12">
              <Droplet className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 mb-6">No blood banks available yet.</p>
              <Link
                href="/organizations/new"
                className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
              >
                Request a Blood Bank
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {organizations.map((org) => (
                  <Link
                    key={org._id}
                    href={`/${org.slug}`}
                    className="block p-8 rounded-3xl bg-slate-900 hover:bg-slate-800 transition-all group border border-slate-800 hover:border-slate-700"
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                      style={{ backgroundColor: `${org.primaryColor || "#D32F2F"}20` }}
                    >
                      <Droplet className="w-8 h-8" style={{ color: org.primaryColor || "#D32F2F" }} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-red-500 transition-colors">
                      {org.name}
                    </h3>
                    <div
                      className="inline-flex items-center text-sm font-bold group-hover:translate-x-1 transition-transform"
                      style={{ color: org.primaryColor || "#D32F2F" }}
                    >
                      Visit Blood Bank <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-12">
                <Link
                  href="/organizations/new"
                  className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Don't see your community? <span className="text-red-500 ml-1 font-bold">Request a Blood Bank</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-red-600 to-red-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Save Lives?
          </h2>
          <p className="text-xl text-red-100 max-w-xl mx-auto mb-10">
            Join thousands of donors who have already helped save lives in their communities.
          </p>
          <Link
            href="#organizations"
            className="inline-flex items-center justify-center h-14 px-8 rounded-xl bg-white text-red-600 text-lg font-bold hover:bg-red-50 transition-colors shadow-lg"
          >
            <Heart className="w-5 h-5 mr-2 fill-current" />
            Become a Donor Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-800 text-slate-400">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Droplet className="w-6 h-6 text-red-500 fill-current" />
              <span className="text-lg font-bold text-white">BloodBank</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} Bangladesh Blood Bank. A non-profit initiative for rural communities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

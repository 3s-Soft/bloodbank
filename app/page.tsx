"use client";

import {
  Droplet,
  Heart,
  Users,
  Search,
  ArrowRight,
  Shield,
  Clock,
  MapPin,
  LogOut,
  User,
  Loader2,
  Zap,
  ChevronRight,
  Globe,
  Activity,
} from "lucide-react";
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* ===== NAVIGATION ===== */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Droplet className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              Blood<span className="text-red-500">Bank</span>
            </span>
          </Link>
          <div className="flex items-center space-x-3">
            {status === "loading" ? (
              <div className="w-24 h-10 bg-slate-800/50 rounded-xl animate-pulse" />
            ) : status === "authenticated" && session?.user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-sm text-slate-300 font-medium">{session.user.name || session.user.email}</span>
                </div>
                {(session.user as any).role === "super_admin" && (
                  <Link
                    href="/admin"
                    className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="h-9 px-4 rounded-xl border border-slate-700/50 text-slate-400 text-sm font-medium hover:bg-slate-800 hover:text-white transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  href="#organizations"
                  className="h-10 px-5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 inline-flex items-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `
                                radial-gradient(ellipse 80% 50% at 20% 50%, #dc262644, transparent),
                                radial-gradient(ellipse 60% 40% at 80% 30%, #7c3aed22, transparent),
                                radial-gradient(ellipse 40% 30% at 50% 80%, #dc262622, transparent)
                            `,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Open Platform • Always Free
              </span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-white leading-[1.05] mb-6">
              Every Drop of
              <br />
              Blood{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-orange-500">
                Saves a Life
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              We connect verified blood donors with patients across Bangladesh — quickly,
              reliably, and completely free of charge. Join your local community blood bank today.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="#organizations"
                className="h-14 px-8 rounded-2xl bg-red-500 text-white text-base font-bold hover:bg-red-600 transition-all shadow-2xl shadow-red-500/20 hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center"
              >
                <Droplet className="w-5 h-5 mr-2" />
                Find a Blood Bank
              </Link>
              <Link
                href="#features"
                className="h-14 px-8 rounded-2xl border border-white/15 text-white text-base font-bold hover:bg-white/5 transition-all inline-flex items-center justify-center"
              >
                Learn How It Works
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-8 mt-14 pt-8 border-t border-white/5">
              {[
                { icon: Shield, label: "Verified Donors", color: "text-emerald-400" },
                { icon: Clock, label: "24/7 Available", color: "text-blue-400" },
                { icon: Heart, label: "100% Free", color: "text-red-400" },
                { icon: Globe, label: "Nationwide", color: "text-purple-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-xs text-slate-500 font-bold hidden sm:inline">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-14 bg-slate-900/40 border-y border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              { value: "750+", label: "Registered Donors", icon: Users, color: "text-blue-400", accent: "from-blue-500/15" },
              { value: "3,500+", label: "Lives Saved", icon: Heart, color: "text-rose-400", accent: "from-rose-500/15" },
              { value: "45+", label: "Areas Covered", icon: MapPin, color: "text-emerald-400", accent: "from-emerald-500/15" },
              { value: "24/7", label: "Always Available", icon: Activity, color: "text-purple-400", accent: "from-purple-500/15" },
            ].map((stat, idx) => (
              <div key={idx} className="group relative p-6 md:p-8 rounded-2xl bg-slate-950/60 border border-slate-800 overflow-hidden text-center">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-3`} />
                  <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="features" className="py-24 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-4 block">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Our platform is designed for simplicity and speed — helping you find or provide blood when it matters most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {[
              {
                icon: Search,
                title: "Find Donors Fast",
                desc: "Search by blood group, district, and upazila to find available donors instantly.",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
                border: "hover:border-blue-500/30",
              },
              {
                icon: Shield,
                title: "Verified Network",
                desc: "All donors are verified by local volunteers to ensure trust and reliability.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "hover:border-emerald-500/30",
              },
              {
                icon: Clock,
                title: "24/7 Availability",
                desc: "Post requests anytime. Our platform works around the clock for emergencies.",
                color: "text-amber-400",
                bg: "bg-amber-500/10",
                border: "hover:border-amber-500/30",
              },
              {
                icon: MapPin,
                title: "Hyperlocal Focus",
                desc: "Designed for communities where every minute counts. Find help nearby.",
                color: "text-red-400",
                bg: "bg-red-500/10",
                border: "hover:border-red-500/30",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`group p-7 rounded-2xl bg-slate-900/50 border border-slate-800 ${feature.border} transition-all hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ORGANIZATIONS ===== */}
      <section id="organizations" className="py-24 bg-slate-900/30 border-t border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-4 block">
              Community Blood Banks
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Join Your Local Blood Bank
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Select your community&apos;s blood bank to register as a donor or search for available donors.
            </p>
          </div>

          {loadingOrgs ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
              </div>
              <p className="text-sm text-slate-500 font-medium">Loading blood banks...</p>
            </div>
          ) : organizations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-3xl bg-slate-800/50 border border-slate-700 flex items-center justify-center mx-auto mb-6">
                <Droplet className="w-10 h-10 text-slate-600" />
              </div>
              <p className="text-slate-400 mb-2 font-medium">No blood banks available yet</p>
              <p className="text-sm text-slate-600 mb-8">Be the first to set up a community blood bank</p>
              <Link
                href="/organizations/new"
                className="h-12 px-6 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all inline-flex items-center shadow-lg shadow-red-500/20"
              >
                <Zap className="w-4 h-4 mr-2" />
                Request a Blood Bank
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
                {organizations.map((org) => {
                  const color = org.primaryColor || "#dc2626";
                  return (
                    <Link
                      key={org._id}
                      href={`/${org.slug}`}
                      className="group block"
                    >
                      <div className="relative h-full p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 overflow-hidden">
                        {/* Subtle gradient on hover */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            backgroundImage: `radial-gradient(ellipse at top left, ${color}08, transparent 60%)`,
                          }}
                        />

                        <div className="relative">
                          <div className="flex items-start justify-between mb-5">
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center"
                              style={{ backgroundColor: `${color}15` }}
                            >
                              <Droplet className="w-7 h-7" style={{ color }} />
                            </div>
                            {org.isVerified && (
                              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <Shield className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Verified</span>
                              </div>
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-slate-100 transition-colors">
                            {org.name}
                          </h3>

                          <div
                            className="inline-flex items-center gap-1 text-sm font-bold group-hover:gap-2 transition-all"
                            style={{ color }}
                          >
                            Visit Blood Bank <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="text-center mt-10">
                <Link
                  href="/organizations/new"
                  className="inline-flex items-center text-sm text-slate-500 hover:text-white transition-colors font-medium"
                >
                  Don&apos;t see your community?{" "}
                  <span className="text-red-400 ml-1 font-bold">Request a Blood Bank</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(ellipse at 50% 100%, #dc262644, transparent 70%)`,
            }}
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="rounded-3xl p-10 md:p-16 text-center relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="absolute -top-20 -left-20 w-56 h-56 bg-red-500/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-purple-500/15 rounded-full blur-[100px]" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto mb-8 flex items-center justify-center">
                <Heart className="w-8 h-8 text-red-500 fill-current" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                Ready to Save Lives?
              </h2>
              <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
                Join thousands of donors who have already helped save lives in their communities.
                Your one donation can save up to three lives.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="#organizations"
                  className="h-14 px-10 rounded-2xl bg-red-500 text-white text-base font-bold hover:bg-red-600 transition-all shadow-2xl shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center"
                >
                  <Heart className="w-5 h-5 mr-2 fill-current" />
                  Become a Donor Today
                </Link>
                <Link
                  href="#organizations"
                  className="h-14 px-10 rounded-2xl border border-white/15 text-white text-base font-bold hover:bg-white/5 transition-all inline-flex items-center justify-center"
                >
                  Explore Blood Banks
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="w-full border-t border-slate-800 bg-slate-900 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Branding */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <Droplet className="w-5 h-5 text-white fill-current" />
                </div>
                <span className="text-xl font-black text-white tracking-tight">
                  Blood<span className="text-red-500">Bank</span>
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                A professional, non-profit collective initiative to unify blood donation across Bangladesh.
                Connecting donors with patients — quickly, reliably, and free.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Quick Links</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link href="#organizations" className="text-slate-400 hover:text-white transition-colors">Find Blood Banks</Link></li>
                <li><Link href="#features" className="text-slate-400 hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/login" className="text-slate-400 hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/organizations/new" className="text-slate-400 hover:text-white transition-colors">Request a Blood Bank</Link></li>
              </ul>
            </div>

            {/* Platform */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Platform</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Designed for rural communities where every minute counts. Our platform connects verified blood donors with patients in need — 24/7 and completely free of charge.
              </p>
              <div className="pt-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                Powered by Bangladesh BloodBank
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-slate-500 font-medium">
              © {new Date().getFullYear()} Bangladesh Blood Bank. All rights reserved.
            </p>
            <div className="flex space-x-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <Link href="#" className="hover:text-white transition-colors">Data Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Platform Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

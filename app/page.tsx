import {
  Droplet,
  Heart,
  Search,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Activity,
} from "lucide-react";
import Link from "next/link";
import connectToDatabase from "@/lib/db/mongodb";
import { Organization } from "@/lib/models/Organization";
import LandingNav from "@/components/LandingNav";

export const dynamic = "force-dynamic";

interface OrganizationData {
  _id: string;
  name: string;
  slug: string;
  primaryColor: string;
  isActive: boolean;
  isVerified: boolean;
}

async function getOrganizations(): Promise<OrganizationData[]> {
  await connectToDatabase();
  const orgs = await Organization.find({ isActive: true }).lean();
  return JSON.parse(JSON.stringify(orgs));
}

export default async function Home() {
  const organizations = await getOrganizations();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* ===== NAVIGATION ===== */}
      <LandingNav />

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-32 pb-20 overflow-hidden lg:pt-48 lg:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-white/5 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Live in 64 Districts Across Bangladesh
            </span>
          </div>

          <h1 className="text-5xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
            Every Drop <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
              Saves a Life.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            A professional community-driven platform connecting blood donors and recipients across Bangladesh.
            Finding blood shouldn't be hard. We make it simple, fast, and 100% free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#organizations"
              className="group h-14 px-8 rounded-2xl bg-red-500 text-white text-base font-bold hover:bg-red-600 transition-all shadow-2xl shadow-red-500/20 flex items-center gap-3"
            >
              <Heart className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              Find Blood Bank
            </Link>
            <Link
              href="/docs"
              className="h-14 px-8 rounded-2xl border border-white/10 text-white text-base font-bold hover:bg-white/5 transition-all flex items-center gap-3"
            >
              Learn More
              <ArrowRight className="w-5 h-5 text-slate-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== ORGANIZATIONS GRID ===== */}
      <section id="organizations" className="py-24 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest mb-3">
                <div className="w-8 h-px bg-red-500" /> Network
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Active Blood Banks</h2>
            </div>
            <p className="text-slate-500 text-sm max-w-md font-medium">
              We've partnered with trusted organizations to ensure every donation is safe, verified, and impactful.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {organizations.map((org) => (
              <Link
                key={org._id}
                href={`/${org.slug}`}
                className="group relative h-48 rounded-3xl bg-slate-900/50 border border-white/5 overflow-hidden p-8 hover:bg-slate-900 transition-all hover:scale-[1.02] hover:border-red-500/20"
              >
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-start justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: `${org.primaryColor}20` }}
                    >
                      <Droplet className="w-6 h-6" style={{ color: org.primaryColor }} />
                    </div>
                    {org.isVerified && (
                      <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-blue-500" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Verified</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight group-hover:text-red-500 transition-colors">
                      {org.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      Enter Blood Bank <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            <Link
              href="/organizations/new"
              className="group relative h-48 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-8 hover:bg-white/5 hover:border-white/20 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-bold text-slate-400">Add Your Organization</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-24 bg-slate-900/50 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Search,
                title: "Precision Matching",
                desc: "Our geo-targeting algorithm finds the nearest available donors in your Upazila within seconds.",
                color: "text-blue-500"
              },
              {
                icon: Shield,
                title: "Verified Security",
                desc: "Every donor and organization is manually verified to maintain the highest standards of safety.",
                color: "text-emerald-500"
              },
              {
                icon: Activity,
                title: "Real-time Requests",
                desc: "Instant notifications for emergency blood requests sent directly to compatible donors.",
                color: "text-red-500"
              }
            ].map((feature, i) => (
              <div key={i} className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PLATFORM COUNTER ===== */}
      <section className="py-24 bg-slate-950 overflow-hidden relative">
        <div className="container mx-auto px-4">
          <div className="p-12 md:p-20 rounded-[4rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-56 h-56 bg-red-500/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-purple-500/15 rounded-full blur-[100px]" />

            <div className="relative text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto mb-8 flex items-center justify-center">
                <Heart className="w-8 h-8 text-red-500 fill-current" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                Ready to Save Lives?
              </h2>
              <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed font-medium">
                Join thousands of donors who have already helped save lives in their communities.
                Your one donation can save up to three lives.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/login"
                  className="h-14 px-10 rounded-2xl bg-red-500 text-white text-base font-bold hover:bg-red-600 transition-all shadow-2xl shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5 fill-current" />
                  Become a Donor
                </Link>
                <Link
                  href="/docs"
                  className="h-14 px-10 rounded-2xl border border-white/15 text-white text-base font-bold hover:bg-white/5 transition-all inline-flex items-center justify-center gap-2"
                >
                  View Documentation
                  <ArrowRight className="w-5 h-5" />
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
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm font-medium">
                A professional, non-profit collective initiative to unify blood donation across Bangladesh.
                Connecting donors with patients — quickly, reliably, and free.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Quick Links</h4>
              <ul className="space-y-3 text-sm font-bold">
                <li><Link href="#organizations" className="text-slate-400 hover:text-white transition-colors">Find Blood Banks</Link></li>
                <li><Link href="/docs" className="text-slate-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/login" className="text-slate-400 hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/organizations/new" className="text-slate-400 hover:text-white transition-colors">Request Organization</Link></li>
              </ul>
            </div>

            {/* Platform */}
            <div className="space-y-6">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Our Infrastructure</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Designed for rural communities where every minute counts. Our platform connects verified blood donors with patients in need — 24/7 and completely free of charge.
              </p>
              <div className="pt-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                Network Bangladesh
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-slate-500 font-bold">
              © {new Date().getFullYear()} Bangladesh Blood Bank.
            </p>
            <div className="flex space-x-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
              <Link href="/docs#safety" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/docs#vision" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

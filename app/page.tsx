import { Droplet, Heart, Users, Search, ArrowRight, Shield, Clock, MapPin } from "lucide-react";
import Link from "next/link";

export default function Home() {
  // Featured organizations - in production, fetch from API
  const featuredOrgs = [
    { name: "Savar Blood Bank", slug: "savar-blood-bank", color: "#D32F2F", donors: 250, requests: 12 },
    { name: "Uttara Donors", slug: "uttara-donors", color: "#1976D2", donors: 180, requests: 8 },
    { name: "Mirpur Life Savers", slug: "mirpur-life-savers", color: "#388E3C", donors: 320, requests: 15 },
  ];

  const features = [
    { icon: Search, title: "Find Donors Fast", desc: "Search by blood group, district, and upazila to find available donors instantly." },
    { icon: Shield, title: "Verified Network", desc: "All donors are verified by local volunteers to ensure reliability." },
    { icon: Clock, title: "24/7 Availability", desc: "Post requests anytime. Our platform works around the clock." },
    { icon: MapPin, title: "Hyperlocal Focus", desc: "Designed specifically for rural communities where every minute counts." },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-red-50 p-1.5 rounded-lg group-hover:bg-red-100 transition-colors">
              <Droplet className="w-6 h-6 fill-current text-red-600" />
            </div>
            <span className="text-xl font-bold text-neutral-900 tracking-tight">
              Blood<span className="text-red-600">Bank</span>
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-neutral-600 hover:text-red-600 transition-colors"
            >
              Login
            </Link>
            <Link
              href="#organizations"
              className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-red-50 rounded-full mb-6">
              <Heart className="w-4 h-4 text-red-600 fill-current" />
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                Community-Powered Blood Donation
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-neutral-900 leading-tight mb-6">
              Every Drop of Blood <span className="text-red-600">Saves a Life.</span>
            </h1>
            <p className="text-xl text-neutral-600 mb-10 leading-relaxed max-w-2xl">
              We connect blood donors with patients in rural areas of Bangladesh, quickly and free of charge. Join your local community blood bank today.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="#organizations"
                className="inline-flex items-center justify-center h-14 px-8 rounded-xl bg-red-600 text-white text-lg font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                <Droplet className="w-5 h-5 mr-2" />
                Find a Blood Bank
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center h-14 px-8 rounded-xl border-2 border-neutral-200 text-neutral-700 text-lg font-semibold hover:border-red-200 hover:bg-red-50 transition-colors"
              >
                Learn How It Works
              </Link>
            </div>
          </div>
        </div>
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-50 to-transparent -z-10 hidden lg:block" />
        <div className="absolute bottom-0 right-20 hidden lg:block opacity-10">
          <Droplet className="w-96 h-96 text-red-600" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-neutral-50 border-y border-neutral-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "750+", label: "Registered Donors" },
              { value: "3,500+", label: "Lives Saved" },
              { value: "45+", label: "Villages Covered" },
              { value: "24/7", label: "Support Available" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-black text-red-600 mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-neutral-900 mb-4">How It Works</h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              Our platform is designed for simplicity and speed, helping you find or provide blood when it matters most.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-neutral-50 hover:bg-red-50 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md transition-shadow">
                  <feature.icon className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">{feature.title}</h3>
                <p className="text-neutral-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organizations Section */}
      <section id="organizations" className="py-24 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-neutral-900 mb-4">Join Your Local Blood Bank</h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              Select your community's blood bank to register as a donor or search for available donors.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {featuredOrgs.map((org, idx) => (
              <Link
                key={idx}
                href={`/${org.slug}`}
                className="block p-8 rounded-3xl bg-white shadow-sm hover:shadow-xl transition-all group border border-neutral-100"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${org.color}15` }}
                >
                  <Droplet className="w-8 h-8" style={{ color: org.color }} />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3 group-hover:text-red-600 transition-colors">
                  {org.name}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-neutral-500 mb-6">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" /> {org.donors} donors
                  </span>
                  <span className="flex items-center">
                    <Droplet className="w-4 h-4 mr-1" /> {org.requests} active
                  </span>
                </div>
                <div
                  className="inline-flex items-center text-sm font-bold group-hover:translate-x-1 transition-transform"
                  style={{ color: org.color }}
                >
                  Visit Blood Bank <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-red-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Save Lives?
          </h2>
          <p className="text-xl text-red-100 max-w-xl mx-auto mb-10">
            Join thousands of donors who have already helped save lives in their communities.
          </p>
          <Link
            href="#organizations"
            className="inline-flex items-center justify-center h-14 px-8 rounded-xl bg-white text-red-600 text-lg font-semibold hover:bg-red-50 transition-colors shadow-lg"
          >
            <Heart className="w-5 h-5 mr-2 fill-current" />
            Become a Donor Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-neutral-900 text-neutral-400">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Droplet className="w-6 h-6 text-red-500 fill-current" />
              <span className="text-lg font-bold text-white">BloodBank</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} Rural Blood Bank. A non-profit initiative for rural communities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

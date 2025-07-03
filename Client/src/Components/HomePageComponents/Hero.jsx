import React from 'react';
import { Link } from 'react-router';
import { HeartPulse } from 'lucide-react'; // optional icon, install `lucide-react` if needed

const Hero = () => {
    return (
        <div className="bg-gradient-to-br from-red-100 via-white to-red-50 py-24 px-6">
            <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
                {/* Text Section */}
                <div className="text-center lg:text-left">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-red-700 leading-tight mb-6">
                        Be a <span className="text-red-500">Hero</span> <br />
                        Donate Blood Today
                    </h1>
                    <p className="text-gray-700 text-lg mb-8 max-w-xl">
                        Every drop counts. Your one donation can save up to three lives. Join the movement and help build a healthier tomorrow.
                    </p>
                    <Link
                        to="/donate"
                        className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full text-lg font-medium hover:bg-red-700 transition shadow-md"
                    >
                        <HeartPulse className="w-5 h-5 animate-pulse" />
                        Donate Now
                    </Link>
                </div>

                {/* Image Section */}
                <div className="relative">
                    <img
                        src="https://www.wockhardthospitals.com/wp-content/uploads/2020/01/shutterstock_264395594-1-768x768-1.webp"
                        alt="Donate Blood"
                        className="w-80 h-auto drop-shadow-xl animate-fade-in"
                    />
                    <div className="absolute -bottom-6 -right-6 bg-white border border-red-200 rounded-xl px-4 py-2 shadow-sm text-red-600 font-semibold text-sm">
                        🩸 1 Donation = 3 Lives
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;

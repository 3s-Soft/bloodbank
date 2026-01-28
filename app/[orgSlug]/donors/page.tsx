"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Droplet, MapPin, Phone, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function DonorDiscovery() {
    const organization = useOrganization();
    const primaryColor = organization.primaryColor || "#D32F2F";
    const [bloodGroup, setBloodGroup] = useState("");
    const [district, setDistrict] = useState("");
    const [upazila, setUpazila] = useState("");
    const [donors, setDonors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDonors = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                orgSlug: organization.slug,
                bloodGroup,
                district,
                upazila,
            });
            const res = await fetch(`/api/donors?${params.toString()}`);
            const data = await res.json();
            setDonors(data);
        } catch (error) {
            console.error("Failed to fetch donors", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDonors();
    }, [bloodGroup, organization.slug]);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="max-w-xl">
                    <h1 className="text-4xl font-black text-neutral-900 mb-4">Find Blood Donors</h1>
                    <p className="text-neutral-500 font-medium leading-relaxed">
                        Searching for compassionate individuals ready to save lives in {organization.name}.
                    </p>
                </div>
                <div className="flex flex-wrap gap-4">
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
                        <button
                            key={group}
                            onClick={() => setBloodGroup(group === bloodGroup ? "" : group)}
                            className={`w-12 h-12 rounded-xl border-2 font-bold transition-all ${bloodGroup === group
                                ? "border-red-600 bg-red-600 text-white"
                                : "border-neutral-100 bg-white text-neutral-600 hover:border-red-200"
                                }`}
                        >
                            {group}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm p-6">
                        <h3 className="font-bold text-neutral-900 mb-4 uppercase text-xs tracking-widest">Location Filters</h3>
                        <div className="space-y-4">
                            <Input
                                label="District"
                                placeholder="Search District..."
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                            />
                            <Input
                                label="Upazila"
                                placeholder="Search Upazila..."
                                value={upazila}
                                onChange={(e) => setUpazila(e.target.value)}
                            />
                            <Button
                                className="w-full text-white"
                                style={{ backgroundColor: primaryColor }}
                                onClick={fetchDonors}
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Filter Results
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Results Grid */}
                <div className="lg:col-span-3">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <p className="font-medium">Finding potential life savers...</p>
                        </div>
                    ) : donors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {donors.map((donor) => (
                                <Card key={donor._id} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                    <div className="h-1.5 w-full" style={{ backgroundColor: donor.isAvailable ? primaryColor : "#E5E7EB" }} />
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center font-black text-xl text-red-600 border-2 border-neutral-100">
                                                    {donor.bloodGroup}
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="font-bold text-neutral-900 text-lg">{donor.user?.name}</h3>
                                                        {donor.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                                                    </div>
                                                    <p className="text-sm text-neutral-500 font-medium">
                                                        {donor.lastDonationDate
                                                            ? `Last donated: ${new Date(donor.lastDonationDate).toLocaleDateString()}`
                                                            : "First time donor"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${donor.isAvailable ? "bg-green-50 text-green-600" : "bg-neutral-100 text-neutral-400"
                                                }`}>
                                                {donor.isAvailable ? "Available" : "Not Available"}
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-6 text-sm text-neutral-600">
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-2 opacity-50" />
                                                {[donor.village, donor.upazila, donor.district].filter(Boolean).join(", ")}
                                            </div>
                                        </div>

                                        <div className="flex space-x-3">
                                            <a href={`tel:${donor.user?.phone}`} className="flex-grow">
                                                <Button variant="outline" className="w-full group-hover:bg-red-50 group-hover:border-red-200 transition-colors">
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    Call Now
                                                </Button>
                                            </a>
                                            <Button variant="outline" className="px-3">
                                                <Droplet className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-200">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-neutral-300">
                                <Users className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900">No Donors Found</h3>
                            <p className="text-neutral-500">Try adjusting your filters or checking back later.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

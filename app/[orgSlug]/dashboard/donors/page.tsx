"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Users,
    CheckCircle2,
    XCircle,
    Phone,
    MapPin,
    Loader2,
    ShieldCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner"; // Assuming sonner is installed for notifications

export default function DonorManagement() {
    const organization = useOrganization();
    const orgSlug = organization.slug;
    const primaryColor = organization.primaryColor || "#D32F2F";
    const [donors, setDonors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDonors = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/donors?orgSlug=${orgSlug}`);
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
    }, [orgSlug]);

    const handleVerify = async (donorId: string, currentStatus: boolean) => {
        try {
            const res = await fetch("/api/donors/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ donorId, isVerified: !currentStatus })
            });
            if (res.ok) {
                toast.success(currentStatus ? "Verified status removed" : "Donor verified successfully!");
                fetchDonors();
            }
        } catch (error) {
            toast.error("Failed to update verification status");
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-neutral-900 mb-2">Manage Donors</h1>
                    <p className="text-neutral-500 font-medium tracking-tight">Verify and manage the lifesaver network of {organization.name}.</p>
                </div>
                <div className="flex bg-neutral-100 p-1 rounded-xl">
                    <button className="px-6 py-2 bg-white rounded-lg shadow-sm text-sm font-bold text-neutral-900">All Donors</button>
                    <button className="px-6 py-2 rounded-lg text-sm font-bold text-neutral-500 hover:text-neutral-900">Unverified</button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 text-neutral-400">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="font-bold">Syncing donor database...</p>
                </div>
            ) : donors.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {donors.map((donor) => (
                        <Card key={donor._id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                                    <div className="w-16 h-16 rounded-3xl bg-neutral-50 flex items-center justify-center font-black text-2xl text-red-600 border-2 border-neutral-100 shrink-0">
                                        {donor.bloodGroup}
                                    </div>
                                    <div className="text-center md:text-left">
                                        <div className="flex items-center justify-center md:justify-start space-x-2 mb-1">
                                            <h3 className="font-black text-neutral-900 text-xl">{donor.user?.name}</h3>
                                            {donor.isVerified ? (
                                                <Badge label="Verified" color="green" />
                                            ) : (
                                                <Badge label="Pending" color="orange" />
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-neutral-500 font-medium">
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-1.5 opacity-40" />
                                                {donor.village}, {donor.upazila}
                                            </div>
                                            <div className="flex items-center">
                                                <Phone className="w-4 h-4 mr-1.5 opacity-40" />
                                                {donor.user?.phone}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 w-full md:w-auto">
                                    <Button
                                        variant={donor.isVerified ? "outline" : "primary"}
                                        className={!donor.isVerified ? "text-white" : ""}
                                        style={!donor.isVerified ? { backgroundColor: primaryColor } : {}}
                                        onClick={() => handleVerify(donor._id, donor.isVerified)}
                                    >
                                        {donor.isVerified ? (
                                            <><XCircle className="w-4 h-4 mr-2" /> Unverify</>
                                        ) : (
                                            <><ShieldCheck className="w-4 h-4 mr-2" /> Verify Now</>
                                        )}
                                    </Button>
                                    <a href={`tel:${donor.user?.phone}`}>
                                        <Button variant="secondary" className="px-3">
                                            <Phone className="w-4 h-4" />
                                        </Button>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-40 border-4 border-dashed border-neutral-100 rounded-[3rem]">
                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-neutral-300" />
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900 mb-2">No donors registered yet</h2>
                    <p className="text-neutral-500 max-w-sm mx-auto mb-8 font-medium italic">Share your organization's registration link to start building your network.</p>
                </div>
            )}
        </div>
    );
}

function Badge({ label, color }: { label: string, color: string }) {
    const styleMap: Record<string, string> = {
        green: "bg-green-100 text-green-700",
        orange: "bg-orange-100 text-orange-700",
    };
    const styles = styleMap[color] || "bg-neutral-100 text-neutral-700";

    return (
        <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${styles}`}>
            {label}
        </div>
    );
}

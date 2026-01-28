"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Droplet, Calendar, MapPin, Phone, AlertTriangle, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function BloodRequestsListing() {
    const organization = useOrganization();
    const orgSlug = organization.slug;
    const primaryColor = organization.primaryColor || "#D32F2F";

    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/requests?orgSlug=${orgSlug}`);
                const data = await res.json();
                setRequests(data);
            } catch (error) {
                console.error("Failed to fetch requests", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRequests();
    }, [orgSlug]);

    const getUrgencyStyles = (urgency: string) => {
        switch (urgency) {
            case "emergency": return "bg-red-600 text-white animate-pulse";
            case "urgent": return "bg-orange-500 text-white";
            default: return "bg-neutral-100 text-neutral-600";
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="max-w-xl">
                    <h1 className="text-4xl font-black text-neutral-900 mb-4">Blood Requests</h1>
                    <p className="text-neutral-500 font-medium leading-relaxed">
                        Active requests in {organization.name}. Your small act of kindness can save a neighbor's life.
                    </p>
                </div>
                <Link href={`/${orgSlug}/requests/new`}>
                    <Button size="lg" className="w-full md:w-auto text-white shadow-lg" style={{ backgroundColor: primaryColor }}>
                        <Plus className="w-5 h-5 mr-2" />
                        Post New Request
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 max-w-4xl">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p className="font-medium">Finding active requests nearby...</p>
                    </div>
                ) : requests.length > 0 ? (
                    requests.map((request) => (
                        <Card key={request._id} className="border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            {request.urgency === "emergency" && (
                                <div className="absolute top-0 right-0 py-1.5 px-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl z-10 flex items-center">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Critical
                                </div>
                            )}
                            <CardContent className="p-0 flex flex-col md:flex-row">
                                <div className={`w-full md:w-32 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-neutral-100 ${request.urgency === "emergency" ? "bg-red-50" : "bg-neutral-50"
                                    }`}>
                                    <div className="text-3xl font-black text-red-600 mb-1">{request.bloodGroup}</div>
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${getUrgencyStyles(request.urgency)}`}>
                                        {request.urgency}
                                    </div>
                                </div>

                                <div className="flex-grow p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-neutral-900 mb-1">{request.patientName}</h3>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 font-medium">
                                                <div className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-1.5 opacity-50" />
                                                    {request.location}, {request.upazila}
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1.5 opacity-50" />
                                                    Needed: {new Date(request.requiredDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <a href={`tel:${request.contactNumber}`} className="flex-grow">
                                                <Button style={{ backgroundColor: primaryColor }} className="w-full text-white px-6">
                                                    Contact
                                                </Button>
                                            </a>
                                            <Button variant="outline" className="px-3">
                                                <Phone className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {request.urgency === "emergency" && (
                                        <p className="text-sm text-red-600 font-bold bg-red-50 p-3 rounded-lg flex items-center">
                                            <Droplet className="w-4 h-4 mr-2" />
                                            Immediate donor required for surgery. please contact now!
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-20 bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-neutral-300">
                            <Droplet className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900">No Active Requests</h3>
                        <p className="text-neutral-500">Everything looks calm in {organization.name} right now.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

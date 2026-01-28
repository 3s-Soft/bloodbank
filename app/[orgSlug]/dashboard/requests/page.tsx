"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Droplet,
    CheckCircle2,
    XCircle,
    Phone,
    MapPin,
    Loader2,
    Calendar,
    AlertTriangle
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function RequestManagement() {
    const organization = useOrganization();
    const orgSlug = organization.slug;
    const primaryColor = organization.primaryColor || "#D32F2F";
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/requests?orgSlug=${orgSlug}&status=pending`);
            const data = await res.json();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [orgSlug]);

    const handleStatusUpdate = async (requestId: string, newStatus: string) => {
        try {
            const res = await fetch("/api/requests/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, status: newStatus })
            });
            if (res.ok) {
                toast.success(`Request marked as ${newStatus}`);
                fetchRequests();
            }
        } catch (error) {
            toast.error("Failed to update request status");
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-neutral-900 mb-2">Manage Blood Requests</h1>
                    <p className="text-neutral-500 font-medium">Coordinate and fulfill emergency requests in {organization.name}.</p>
                </div>
                <div className="flex bg-neutral-100 p-1 rounded-xl">
                    <button className="px-6 py-2 bg-white rounded-lg shadow-sm text-sm font-bold text-neutral-900">Active</button>
                    <button className="px-6 py-2 rounded-lg text-sm font-bold text-neutral-500 hover:text-neutral-900">Fulfilled</button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 text-neutral-400">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="font-bold">Syncing active requests...</p>
                </div>
            ) : requests.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {requests.map((request) => (
                        <Card key={request._id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                            <CardContent className="p-0 flex flex-col md:flex-row">
                                <div className={`w-full md:w-32 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-neutral-100 ${request.urgency === "emergency" ? "bg-red-50" : "bg-neutral-50"
                                    }`}>
                                    <div className="text-3xl font-black text-red-600 mb-1">{request.bloodGroup}</div>
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${request.urgency === "emergency" ? "bg-red-600 text-white animate-pulse" : "bg-neutral-200 text-neutral-600"
                                        }`}>
                                        {request.urgency}
                                    </div>
                                </div>

                                <div className="flex-grow p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex-grow">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="font-black text-neutral-900 text-xl">{request.patientName}</h3>
                                                {request.urgency === "emergency" && <AlertTriangle className="w-5 h-5 text-red-600" />}
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-neutral-500 font-medium">
                                                <div className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-1.5 opacity-40" />
                                                    {request.location}, {request.upazila}
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1.5 opacity-40" />
                                                    {new Date(request.requiredDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center">
                                                    <Phone className="w-4 h-4 mr-1.5 opacity-40" />
                                                    {request.contactNumber}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex md:flex-col lg:flex-row gap-2 shrink-0">
                                            <Button
                                                className="bg-green-600 hover:bg-green-700 text-white flex-grow"
                                                onClick={() => handleStatusUpdate(request._id, "completed")}
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Fulfilled
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="text-neutral-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleStatusUpdate(request._id, "cancelled")}
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-40 border-4 border-dashed border-neutral-100 rounded-[3rem]">
                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-200">
                        <Droplet className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900 mb-2">No active requests</h2>
                    <p className="text-neutral-500 max-w-sm mx-auto font-medium">Your community is currently doing well!</p>
                </div>
            )}
        </div>
    );
}

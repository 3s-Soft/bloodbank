import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { BloodRequest } from "@/lib/models/BloodRequest";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { requestId, status } = await req.json();

        if (!requestId || !status) {
            return NextResponse.json({ error: "Request ID and Status are required" }, { status: 400 });
        }

        const request = await BloodRequest.findByIdAndUpdate(
            requestId,
            { status },
            { new: true }
        );

        if (!request) {
            return NextResponse.json({ error: "Blood request not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Request status updated", request });
    } catch (error: any) {
        console.error("Request status update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

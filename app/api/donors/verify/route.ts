import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { DonorProfile } from "@/lib/models/User";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { donorId, isVerified } = await req.json();

        if (!donorId) {
            return NextResponse.json({ error: "Donor ID is required" }, { status: 400 });
        }

        const donor = await DonorProfile.findByIdAndUpdate(
            donorId,
            { isVerified },
            { new: true }
        );

        if (!donor) {
            return NextResponse.json({ error: "Donor not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Donor status updated", donor });
    } catch (error: any) {
        console.error("Donor verification error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

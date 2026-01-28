import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import BloodRequest from "@/lib/models/BloodRequest";
import Organization from "@/lib/models/Organization";

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const orgSlug = searchParams.get("orgSlug");
        const urgency = searchParams.get("urgency");
        const status = searchParams.get("status") || "pending";

        if (!orgSlug) {
            return NextResponse.json({ error: "Organization slug is required" }, { status: 400 });
        }

        const organization = await Organization.findOne({ slug: orgSlug });
        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        let query: any = { organization: organization._id, status };

        if (urgency) query.urgency = urgency;

        const requests = await BloodRequest.find(query)
            .populate("requester", "name")
            .sort({ urgency: -1, createdAt: -1 });

        return NextResponse.json(requests);
    } catch (error: any) {
        console.error("Fetch requests error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

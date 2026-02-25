import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { AuditLog } from "@/lib/models/AuditLog";
import { Organization } from "@/lib/models/Organization";

// GET: List audit logs for an organization
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const orgSlug = searchParams.get("orgSlug");
        const action = searchParams.get("action");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const limit = parseInt(searchParams.get("limit") || "50");

        if (!orgSlug) {
            return NextResponse.json({ error: "orgSlug is required" }, { status: 400 });
        }

        const org = await Organization.findOne({ slug: orgSlug });
        if (!org) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        const query: Record<string, unknown> = { organization: org._id };

        if (action) query.action = action;

        if (startDate || endDate) {
            const dateFilter: Record<string, Date> = {};
            if (startDate) dateFilter.$gte = new Date(startDate);
            if (endDate) dateFilter.$lte = new Date(endDate);
            query.createdAt = dateFilter;
        }

        const logs = await AuditLog.find(query)
            .populate("performedBy", "name email phone")
            .sort({ createdAt: -1 })
            .limit(limit);

        return NextResponse.json(logs);
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
    }
}

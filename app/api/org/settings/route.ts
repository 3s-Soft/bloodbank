import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Organization } from "@/lib/models/Organization";

// GET - Get organization settings by slug
export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const orgSlug = searchParams.get("orgSlug");

        if (!orgSlug) {
            return NextResponse.json({ error: "Organization slug is required" }, { status: 400 });
        }

        const organization = await Organization.findOne({ slug: orgSlug });
        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        return NextResponse.json(organization);
    } catch (error: any) {
        console.error("Fetch organization error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT - Update organization settings
export async function PUT(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { orgSlug, name, logo, primaryColor, contactEmail, contactPhone, address } = body;

        if (!orgSlug) {
            return NextResponse.json({ error: "Organization slug is required" }, { status: 400 });
        }

        const organization = await Organization.findOneAndUpdate(
            { slug: orgSlug },
            {
                name,
                logo,
                primaryColor,
                contactEmail,
                contactPhone,
                address,
            },
            { new: true }
        );

        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Organization updated successfully", organization });
    } catch (error: any) {
        console.error("Update organization error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { Organization } from "@/lib/models/Organization";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// POST - Create a new organization (public, but requires login)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "You must be logged in to create an organization" }, { status: 401 });
        }

        await connectToDatabase();
        const body = await request.json();

        const { name, slug, contactEmail, contactPhone, address, primaryColor } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
        }

        // Check if slug already exists
        const existingOrg = await Organization.findOne({ slug: slug.toLowerCase() });
        if (existingOrg) {
            return NextResponse.json({ error: "An organization with this slug already exists" }, { status: 400 });
        }

        // Create a new organization (unverified by default)
        const organization = await Organization.create({
            name,
            slug: slug.toLowerCase(),
            contactEmail,
            contactPhone,
            address,
            primaryColor: primaryColor || "#D32F2F",
            isActive: true,
            isVerified: false,
            createdBy: (session.user as any).id,
        });

        return NextResponse.json({
            message: "Organization created successfully! It will be reviewed by an admin.",
            organization,
        }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating organization:", error);
        return NextResponse.json({ error: error.message || "Failed to create organization" }, { status: 500 });
    }
}

// GET - List all verified organizations (for public listing)
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const includeUnverified = searchParams.get("includeUnverified") === "true";

        const filter: any = { isActive: true };
        if (!includeUnverified) {
            // Include organizations that are verified OR don't have isVerified field yet (legacy data)
            filter.$or = [
                { isVerified: true },
                { isVerified: { $exists: false } }
            ];
        }

        const organizations = await Organization.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(organizations);
    } catch (error: any) {
        console.error("Error fetching organizations:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        }, { status: 500 });
    }
}

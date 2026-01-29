import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Organization } from "@/lib/models/Organization";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET - List all organizations
export async function GET() {
    try {
        await connectDB();

        const organizations = await Organization.find({})
            .sort({ createdAt: -1 });

        return NextResponse.json(organizations);
    } catch (error: any) {
        console.error("Fetch organizations error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST - Create new organization
export async function POST(req: Request) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        // Check if user is super_admin (in production, enforce this strictly)
        // if (!session || (session.user as any).role !== "super_admin") {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        const body = await req.json();
        const { name, slug, logo, primaryColor, contactEmail, contactPhone, address } = body;

        // Validate required fields
        if (!name || !slug) {
            return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
        }

        // Check if slug is unique
        const existingOrg = await Organization.findOne({ slug: slug.toLowerCase() });
        if (existingOrg) {
            return NextResponse.json({ error: "Organization with this slug already exists" }, { status: 400 });
        }

        const organization = await Organization.create({
            name,
            slug: slug.toLowerCase().trim(),
            logo,
            primaryColor: primaryColor || "#D32F2F",
            contactEmail,
            contactPhone,
            address,
            isActive: true,
        });

        return NextResponse.json({ message: "Organization created successfully", organization }, { status: 201 });
    } catch (error: any) {
        console.error("Create organization error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Organization } from "@/lib/models/Organization";
import { DonorProfile } from "@/lib/models/User";
import { BloodRequest } from "@/lib/models/BloodRequest";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET - Get single organization by ID
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const organization = await Organization.findById(id);
        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        // Get stats for this organization
        const donorCount = await DonorProfile.countDocuments({ organization: organization._id });
        const requestCount = await BloodRequest.countDocuments({ organization: organization._id });
        const activeRequests = await BloodRequest.countDocuments({
            organization: organization._id,
            status: "pending"
        });

        return NextResponse.json({
            ...organization.toObject(),
            stats: {
                donorCount,
                requestCount,
                activeRequests
            }
        });
    } catch (error: any) {
        console.error("Fetch organization error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT - Update organization
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();

        const { name, slug, logo, primaryColor, contactEmail, contactPhone, address, isActive } = body;

        // Check if slug is unique (excluding current org)
        if (slug) {
            const existingOrg = await Organization.findOne({
                slug: slug.toLowerCase(),
                _id: { $ne: id }
            });
            if (existingOrg) {
                return NextResponse.json({ error: "Organization with this slug already exists" }, { status: 400 });
            }
        }

        const organization = await Organization.findByIdAndUpdate(
            id,
            {
                name,
                slug: slug?.toLowerCase().trim(),
                logo,
                primaryColor,
                contactEmail,
                contactPhone,
                address,
                isActive,
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

// DELETE - Delete organization
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const organization = await Organization.findByIdAndDelete(id);

        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        // Optionally: Delete related data (donors, requests, users)
        // await DonorProfile.deleteMany({ organization: id });
        // await BloodRequest.deleteMany({ organization: id });

        return NextResponse.json({ message: "Organization deleted successfully" });
    } catch (error: any) {
        console.error("Delete organization error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

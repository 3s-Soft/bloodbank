import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Organization } from "@/lib/models/Organization";
import { User, DonorProfile } from "@/lib/models/User";

// GET - List users for an organization
export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const orgSlug = searchParams.get("orgSlug");
        const role = searchParams.get("role");
        const search = searchParams.get("search");

        if (!orgSlug) {
            return NextResponse.json({ error: "Organization slug is required" }, { status: 400 });
        }

        const organization = await Organization.findOne({ slug: orgSlug });
        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        // Build query
        let query: any = { organization: organization._id };

        if (role && role !== "all") {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: new RegExp(search, "i") },
                { phone: new RegExp(search, "i") },
                { email: new RegExp(search, "i") },
            ];
        }

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .lean();

        // Get donor profiles for users who are donors
        const donorUserIds = users.filter(u => u.role === "donor").map(u => u._id);
        const donorProfiles = await DonorProfile.find({
            user: { $in: donorUserIds },
            organization: organization._id
        }).lean();

        // Create a map of user ID to donor profile
        const donorProfileMap = new Map(
            donorProfiles.map(dp => [dp.user.toString(), dp])
        );

        // Enhance users with donor profile data
        const enhancedUsers = users.map(user => ({
            ...user,
            donorProfile: donorProfileMap.get(user._id.toString()) || null,
        }));

        // Get user stats
        const stats = {
            total: await User.countDocuments({ organization: organization._id }),
            donors: await User.countDocuments({ organization: organization._id, role: "donor" }),
            admins: await User.countDocuments({ organization: organization._id, role: "admin" }),
            patients: await User.countDocuments({ organization: organization._id, role: "patient" }),
            volunteers: await User.countDocuments({ organization: organization._id, role: "volunteer" }),
        };

        return NextResponse.json({
            users: enhancedUsers,
            stats,
        });
    } catch (error: any) {
        console.error("Fetch users error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST - Create a new user
export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { name, phone, email, role, orgSlug } = body;

        if (!name || !phone || !orgSlug) {
            return NextResponse.json({ error: "Name, phone, and organization are required" }, { status: 400 });
        }

        const organization = await Organization.findOne({ slug: orgSlug });
        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        // Check if phone already exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return NextResponse.json({ error: "User with this phone already exists" }, { status: 400 });
        }

        const user = await User.create({
            name,
            phone,
            email,
            role: role || "patient",
            organization: organization._id,
        });

        return NextResponse.json({ message: "User created successfully", user }, { status: 201 });
    } catch (error: any) {
        console.error("Create user error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

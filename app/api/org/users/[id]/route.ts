import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { User, DonorProfile } from "@/lib/models/User";

// GET - Get single user by ID
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const user = await User.findById(id).populate("organization").lean();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get donor profile if exists
        const donorProfile = await DonorProfile.findOne({ user: id }).lean();

        return NextResponse.json({
            ...user,
            donorProfile,
        });
    } catch (error: any) {
        console.error("Fetch user error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT - Update user
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();
        const { name, phone, email, role } = body;

        // Check if phone is unique (excluding current user)
        if (phone) {
            const existingUser = await User.findOne({ phone, _id: { $ne: id } });
            if (existingUser) {
                return NextResponse.json({ error: "Phone number already in use" }, { status: 400 });
            }
        }

        const user = await User.findByIdAndUpdate(
            id,
            { name, phone, email, role },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User updated successfully", user });
    } catch (error: any) {
        console.error("Update user error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

// DELETE - Delete user
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        // Delete associated donor profile first
        await DonorProfile.deleteOne({ user: id });

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error: any) {
        console.error("Delete user error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

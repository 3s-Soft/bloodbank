import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "You must be logged in to create an organization" }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, contactEmail, contactPhone, address, primaryColor } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
        }

        const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        const existingOrg = await orgsRef.where("slug", "==", slug.toLowerCase()).limit(1).get();
        
        if (!existingOrg.empty) {
            return NextResponse.json({ error: "An organization with this slug already exists" }, { status: 400 });
        }

        const orgData = {
            name,
            slug: slug.toLowerCase(),
            contactEmail,
            contactPhone,
            address,
            primaryColor: primaryColor || "#D32F2F",
            isActive: true,
            isVerified: false,
            createdBy: session.user.id,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const orgDoc = await orgsRef.add(orgData);

        return NextResponse.json({
            message: "Organization created successfully! It will be reviewed by an admin.",
            organization: { _id: orgDoc.id, ...orgData },
        }, { status: 201 });
    } catch (error: unknown) {
        console.error("Error creating organization:", error);
        return NextResponse.json({ error: (error instanceof Error ? error.message : "Failed to create organization") }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeUnverified = searchParams.get("includeUnverified") === "true";

        let orgsRef: FirebaseFirestore.Query = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        orgsRef = orgsRef.where("isActive", "==", true);
        
        if (!includeUnverified) {
            orgsRef = orgsRef.where("isVerified", "==", true);
        }

        const snapshot = await orgsRef.orderBy("createdAt", "desc").get();
        
        const organizations = snapshot.docs.map(doc => ({
            _id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(organizations);
    } catch (error: unknown) {
        console.error("Error fetching organizations:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            message: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}

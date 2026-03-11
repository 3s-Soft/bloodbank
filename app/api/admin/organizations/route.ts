import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
    try {
        const snapshot = await adminDb.collection(COLLECTIONS.ORGANIZATIONS)
            .orderBy("createdAt", "desc")
            .get();

        const organizations = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
        return NextResponse.json(organizations);
    } catch (error: unknown) {
        console.error("Fetch organizations error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        const body = await req.json();
        const { name, slug, logo, primaryColor, contactEmail, contactPhone, address } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
        }

        const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        const existingOrg = await orgsRef.where("slug", "==", slug.toLowerCase()).limit(1).get();
        if (!existingOrg.empty) {
            return NextResponse.json({ error: "Organization with this slug already exists" }, { status: 400 });
        }

        const orgData = {
            name,
            slug: slug.toLowerCase().trim(),
            logo,
            primaryColor: primaryColor || "#D32F2F",
            contactEmail,
            contactPhone,
            address,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const docRef = await orgsRef.add(orgData);

        return NextResponse.json({ message: "Organization created successfully", organization: { _id: docRef.id, ...orgData } }, { status: 201 });
    } catch (error: unknown) {
        console.error("Create organization error:", error);
        return NextResponse.json({ error: (error instanceof Error ? error.message : "Internal Server Error") }, { status: 500 });
    }
}

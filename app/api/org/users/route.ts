import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";

// GET - List users for an organization
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const orgSlug = searchParams.get("orgSlug");
        const role = searchParams.get("role");
        const search = searchParams.get("search")?.toLowerCase();

        if (!orgSlug) {
            return NextResponse.json({ error: "Organization slug is required" }, { status: 400 });
        }

        const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        const orgSnap = await orgsRef.where("slug", "==", orgSlug).limit(1).get();
        if (orgSnap.empty) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }
        const orgId = orgSnap.docs[0].id;

        // Build query
        let q = adminDb.collection(COLLECTIONS.USERS).where("organization", "==", orgId);

        if (role && role !== "all") {
            q = q.where("role", "==", role);
        }

        const usersSnap = await q.get();
        let users = usersSnap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));

        if (search) {
             users = users.filter((u: Record<string, unknown>) => 
                 (typeof u.name === 'string' && u.name.toLowerCase().includes(search)) ||
                 (typeof u.phone === 'string' && u.phone.toLowerCase().includes(search)) ||
                 (typeof u.email === 'string' && u.email.toLowerCase().includes(search))
             );
        }

        users.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
            type CreatedAtType = { toDate: () => Date } | string | number | undefined;
const getDate = (createdAt: CreatedAtType): Date => {
    if (createdAt && typeof createdAt === 'object' && typeof (createdAt as { toDate?: () => Date }).toDate === 'function') {
        return (createdAt as { toDate: () => Date }).toDate();
    }
    if (typeof createdAt === 'string' || typeof createdAt === 'number') {
        return new Date(createdAt);
    }
    return new Date(0);
};
const dA = getDate(a.createdAt as CreatedAtType);
const dB = getDate(b.createdAt as CreatedAtType);
            return dB.getTime() - dA.getTime();
        });

        // Get donor profiles for users who are donors
        const donorUserIds = users.filter((u: Record<string, unknown>) => u.role === "donor").map((u: Record<string, unknown>) => u._id);
        
        let donorProfiles: Record<string, unknown>[] = [];
        if (donorUserIds.length > 0) {
             // Firestore 'in' has a max of 10. For now fetch by org and filter in memory since we are prototyping
             const allDonorsSnap = await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("organization", "==", orgId).get();
             donorProfiles = allDonorsSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() })).filter((dp: Record<string, unknown>) => donorUserIds.includes(dp.user));
        }

        // Create a map of user ID to donor profile
        const donorProfileMap = new Map(
            donorProfiles.map(dp => [dp.user, dp])
        );

        // Enhance users with donor profile data
        const enhancedUsers = users.map((user: Record<string, unknown>) => ({
            ...user,
            donorProfile: donorProfileMap.get(user._id) || null,
        }));

        // Get user stats
        const stats = {
            total: (await adminDb.collection(COLLECTIONS.USERS).where("organization", "==", orgId).count().get()).data().count,
            donors: (await adminDb.collection(COLLECTIONS.USERS).where("organization", "==", orgId).where("role", "==", "donor").count().get()).data().count,
            admins: (await adminDb.collection(COLLECTIONS.USERS).where("organization", "==", orgId).where("role", "==", "admin").count().get()).data().count,
            patients: (await adminDb.collection(COLLECTIONS.USERS).where("organization", "==", orgId).where("role", "==", "patient").count().get()).data().count,
            volunteers: (await adminDb.collection(COLLECTIONS.USERS).where("organization", "==", orgId).where("role", "==", "volunteer").count().get()).data().count,
        };

        return NextResponse.json({
            users: enhancedUsers,
            stats,
        });
    } catch (error: unknown) {
        console.error("Fetch users error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST - Create a new user
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, phone, email, role, orgSlug } = body;

        if (!name || !phone || !orgSlug) {
            return NextResponse.json({ error: "Name, phone, and organization are required" }, { status: 400 });
        }

        const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        const orgSnap = await orgsRef.where("slug", "==", orgSlug).limit(1).get();
        if (orgSnap.empty) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }
        const orgId = orgSnap.docs[0].id;

        // Check if phone already exists
        const existingUserSnap = await adminDb.collection(COLLECTIONS.USERS).where("phone", "==", phone).limit(1).get();
        if (!existingUserSnap.empty) {
            return NextResponse.json({ error: "User with this phone already exists" }, { status: 400 });
        }
        
        const userData = {
            name,
            phone,
            email: email || null,
            role: role || "patient",
            organization: orgId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const userRef = await adminDb.collection(COLLECTIONS.USERS).add(userData);

        return NextResponse.json({ message: "User created successfully", user: { _id: userRef.id, ...userData } }, { status: 201 });
    } catch (error: unknown) {
        console.error("Create user error:", error);
        return NextResponse.json({ error: (error instanceof Error ? error.message : "Internal Server Error") }, { status: 500 });
    }
}

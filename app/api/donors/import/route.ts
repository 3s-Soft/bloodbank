import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";

const AuditAction = { DONOR_IMPORTED: "DONOR_IMPORTED" };

// POST: Bulk import donors from JSON
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { donors, orgSlug, performedBy } = body;

        if (!donors || !Array.isArray(donors) || !orgSlug) {
            return NextResponse.json(
                { error: "donors (array) and orgSlug are required" },
                { status: 400 }
            );
        }

        const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        const orgSnap = await orgsRef.where("slug", "==", orgSlug).limit(1).get();
        if (orgSnap.empty) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }
        const orgId = orgSnap.docs[0].id;

        const results = {
            total: donors.length,
            success: 0,
            failed: 0,
            errors: [] as { index: number; name: string; error: string }[],
        };

        for (let i = 0; i < donors.length; i++) {
            const donor = donors[i];
            try {
                if (!donor.name || !donor.phone || !donor.bloodGroup || !donor.district || !donor.upazila) {
                    results.failed++;
                    results.errors.push({
                        index: i,
                        name: donor.name || "Unknown",
                        error: "Missing required fields: name, phone, bloodGroup, district, upazila",
                    });
                    continue;
                }

                // Find or create user
                let userId = "";
                const userSnap = await adminDb.collection(COLLECTIONS.USERS).where("phone", "==", donor.phone).limit(1).get();
                if (userSnap.empty) {
                    const newUserRef = await adminDb.collection(COLLECTIONS.USERS).add({
                        name: donor.name,
                        phone: donor.phone,
                        email: donor.email || null,
                        role: "donor",
                        organization: orgId,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    userId = newUserRef.id;
                } else {
                    userId = userSnap.docs[0].id;
                }

                // Check if donor profile already exists for this organization
                const existingProfileSnap = await adminDb.collection(COLLECTIONS.DONOR_PROFILES)
                    .where("user", "==", userId)
                    .where("organization", "==", orgId)
                    .limit(1)
                    .get();

                if (!existingProfileSnap.empty) {
                    results.failed++;
                    results.errors.push({
                        index: i,
                        name: donor.name,
                        error: "Donor profile already exists for this organization",
                    });
                    continue;
                }

                // Create donor profile
                await adminDb.collection(COLLECTIONS.DONOR_PROFILES).add({
                    user: userId,
                    organization: orgId,
                    bloodGroup: donor.bloodGroup,
                    district: donor.district,
                    upazila: donor.upazila,
                    village: donor.village || null,
                    lastDonationDate: donor.lastDonationDate ? new Date(donor.lastDonationDate) : null,
                    totalDonations: donor.totalDonations || 0,
                    isAvailable: donor.isAvailable !== false,
                    isVerified: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                results.success++;
            } catch (err: unknown) {
                results.failed++;
                results.errors.push({
                    index: i,
                    name: donor.name || "Unknown",
                    error: err instanceof Error ? err.message : "Unknown error",
                });
            }
        }

        // Audit log
        if (performedBy) {
            await adminDb.collection(COLLECTIONS.AUDIT_LOGS).add({
                action: AuditAction.DONOR_IMPORTED,
                performedBy,
                organization: orgId,
                details: `Bulk imported ${results.success}/${results.total} donors`,
                metadata: { success: results.success, failed: results.failed },
                createdAt: new Date()
            });
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error("Error importing donors:", error);
        return NextResponse.json({ error: "Failed to import donors" }, { status: 500 });
    }
}

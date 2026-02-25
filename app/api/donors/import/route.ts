import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { User } from "@/lib/models/User";
import { DonorProfile } from "@/lib/models/User";
import { Organization } from "@/lib/models/Organization";
import { AuditLog, AuditAction } from "@/lib/models/AuditLog";

// POST: Bulk import donors from JSON
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { donors, orgSlug, performedBy } = body;

        if (!donors || !Array.isArray(donors) || !orgSlug) {
            return NextResponse.json(
                { error: "donors (array) and orgSlug are required" },
                { status: 400 }
            );
        }

        const org = await Organization.findOne({ slug: orgSlug });
        if (!org) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

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
                let user = await User.findOne({ phone: donor.phone });
                if (!user) {
                    user = await User.create({
                        name: donor.name,
                        phone: donor.phone,
                        email: donor.email || undefined,
                        role: "donor",
                        organization: org._id,
                    });
                }

                // Check if donor profile already exists
                const existingProfile = await DonorProfile.findOne({
                    user: user._id,
                    organization: org._id,
                });

                if (existingProfile) {
                    results.failed++;
                    results.errors.push({
                        index: i,
                        name: donor.name,
                        error: "Donor profile already exists for this organization",
                    });
                    continue;
                }

                // Create donor profile
                await DonorProfile.create({
                    user: user._id,
                    organization: org._id,
                    bloodGroup: donor.bloodGroup,
                    district: donor.district,
                    upazila: donor.upazila,
                    village: donor.village || undefined,
                    lastDonationDate: donor.lastDonationDate ? new Date(donor.lastDonationDate) : undefined,
                    isAvailable: donor.isAvailable !== false,
                    isVerified: false,
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
            await AuditLog.create({
                action: AuditAction.DONOR_IMPORTED,
                performedBy,
                organization: org._id,
                details: `Bulk imported ${results.success}/${results.total} donors`,
                metadata: { success: results.success, failed: results.failed },
            });
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error("Error importing donors:", error);
        return NextResponse.json({ error: "Failed to import donors" }, { status: 500 });
    }
}

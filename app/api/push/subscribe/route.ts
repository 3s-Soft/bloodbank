import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db/mongodb";
import { PushSubscriptionModel } from "@/lib/models/PushSubscription";
import { Organization } from "@/lib/models/Organization";

/** POST /api/push/subscribe – save a push subscription */
export async function POST(req: Request) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const body = await req.json();

        const { subscription, orgSlug, district, bloodGroup } = body;

        if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
            return NextResponse.json({ error: "Invalid subscription object" }, { status: 400 });
        }

        if (!orgSlug) {
            return NextResponse.json({ error: "orgSlug is required" }, { status: 400 });
        }

        const organization = await Organization.findOne({ slug: orgSlug });
        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        await PushSubscriptionModel.findOneAndUpdate(
            { endpoint: subscription.endpoint },
            {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                },
                organization: organization._id,
                user: session?.user?.id ?? undefined,
                district: district ?? undefined,
                bloodGroup: bloodGroup ?? undefined,
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ message: "Subscribed successfully" }, { status: 201 });
    } catch (error) {
        console.error("Push subscribe error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/** DELETE /api/push/subscribe – remove a push subscription */
export async function DELETE(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { endpoint } = body;

        if (!endpoint) {
            return NextResponse.json({ error: "endpoint is required" }, { status: 400 });
        }

        await PushSubscriptionModel.deleteOne({ endpoint });
        return NextResponse.json({ message: "Unsubscribed successfully" });
    } catch (error) {
        console.error("Push unsubscribe error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/lib/db/mongodb";
import { DeliveryTask, TaskStatus } from "@/lib/models/DeliveryTask";
import { User, UserRole } from "@/lib/models/User";

// GET deliveries
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const riderId = searchParams.get("riderId");
        const orgId = searchParams.get("orgId");
        const status = searchParams.get("status");
        const available = searchParams.get("available") === "true";

        await connectToDatabase();

        let query: any = {};

        if (available) {
            query.status = TaskStatus.PENDING;
        } else {
            if (riderId) query.rider = riderId;
            if (orgId) query.organization = orgId;
            if (status) query.status = status;
        }

        const tasks = await DeliveryTask.find(query)
            .populate("bloodRequest")
            .populate("rider", "name phone image")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(tasks);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST create delivery task (Called by Org Admin)
export async function POST(req: Request) {
    try {
        const session = (await getServerSession(authOptions as any)) as any;
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            bloodRequestId,
            organizationId,
            sourceName,
            sourceAddress,
            destinationName,
            destinationAddress,
            contactPhone,
            notes
        } = body;

        await connectToDatabase();

        const task = await DeliveryTask.create({
            bloodRequest: bloodRequestId,
            organization: organizationId,
            status: TaskStatus.PENDING,
            sourceName,
            sourceAddress,
            destinationName,
            destinationAddress,
            contactPhone,
            notes
        });

        return NextResponse.json(task);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH update task (Accept, Pickup, Deliver)
export async function PATCH(req: Request) {
    try {
        const session = (await getServerSession(authOptions as any)) as any;
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { taskId, status } = body;

        if (!taskId || !status) {
            return NextResponse.json({ error: "Missing TaskId or Status" }, { status: 400 });
        }

        await connectToDatabase();
        const task = await DeliveryTask.findById(taskId);

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        // Logic for accepting a task
        if (status === TaskStatus.ACCEPTED) {
            if (task.status !== TaskStatus.PENDING) {
                return NextResponse.json({ error: "Task already taken" }, { status: 400 });
            }
            task.rider = session.user.id as any;
        }

        // Only the assigned rider can update status beyond ACCEPTED
        if (status !== TaskStatus.ACCEPTED && task.rider?.toString() !== session.user.id) {
            return NextResponse.json({ error: "Forbidden: You are not the assigned rider" }, { status: 403 });
        }

        task.status = status;

        if (status === TaskStatus.DELIVERED) {
            task.actualDeliveryTime = new Date();
        }

        await task.save();

        return NextResponse.json(task);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

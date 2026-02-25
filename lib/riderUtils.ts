import { RiderProfile } from "@/lib/models/RiderProfile";
import { DeliveryTask } from "@/lib/models/DeliveryTask";
import connectToDatabase from "@/lib/db/mongodb";

export async function getRiderProfile(userId: string) {
    await connectToDatabase();
    return await RiderProfile.findOne({ user: userId }).populate("organization").lean();
}

export async function getAvailableTasks(district?: string, upazila?: string) {
    await connectToDatabase();
    let query: any = { status: "pending" };
    // In a real app, we'd filter by coverage areas too
    return await DeliveryTask.find(query).sort({ createdAt: -1 }).lean();
}

import connectToDatabase from "./db/mongodb";
import { Organization, IOrganization } from "./models/Organization";

export async function getOrganizationBySlug(slug: string): Promise<IOrganization | null> {
    await connectToDatabase();
    const organization = await Organization.findOne({ slug, isActive: true });
    return organization;
}

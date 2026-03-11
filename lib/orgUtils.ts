import { adminDb } from "./firebase/adminApp";
import { COLLECTIONS, IOrganization } from "./firebase/types";

export async function getOrganizationBySlug(slug: string): Promise<IOrganization | null> {
    const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
    const snapshot = await orgsRef.where("slug", "==", slug).where("isActive", "==", true).limit(1).get();
    
    if (snapshot.empty) return null;
    return { _id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as IOrganization;
}

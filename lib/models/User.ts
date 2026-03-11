export * from "../firebase/types";

// Export the collection names as the "Model" to force TypeScript errors on .findOne() etc.
export const User = "users";
export const DonorProfile = "donorProfiles";

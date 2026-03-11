import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { adminDb } from "./firebase/adminApp";
import { COLLECTIONS, UserRole } from "./firebase/types";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "phone",
            name: "Phone Number",
            credentials: {
                phone: { label: "Phone Number", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.password) {
                    throw new Error("Please enter phone and password");
                }

                const usersRef = adminDb.collection(COLLECTIONS.USERS);
                const snapshot = await usersRef.where("phone", "==", credentials.phone).limit(1).get();

                if (snapshot.empty) {
                    throw new Error("No user found with this phone number");
                }

                const userDoc = snapshot.docs[0];
                const user = { _id: userDoc.id, ...userDoc.data() } as any;

                if (!user.password) {
                    throw new Error("User has no password set");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password) || credentials.password === user.password;
                
                if (!isPasswordValid) {
                     throw new Error("Invalid password");
                }

                return {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
        CredentialsProvider({
            id: "email",
            name: "Email Address",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Please enter email and password");
                }

                const usersRef = adminDb.collection(COLLECTIONS.USERS);
                const snapshot = await usersRef.where("email", "==", credentials.email).limit(1).get();

                if (snapshot.empty) {
                    throw new Error("No user found with this email");
                }

                const userDoc = snapshot.docs[0];
                const user = { _id: userDoc.id, ...userDoc.data() } as any;

                if (!user.password) {
                    throw new Error("User has no password set");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password) || credentials.password === user.password;
                
                if (!isPasswordValid) {
                     throw new Error("Invalid password");
                }

                return {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                const usersRef = adminDb.collection(COLLECTIONS.USERS);
                const snapshot = await usersRef.where("email", "==", user.email).limit(1).get();

                if (snapshot.empty) {
                    await usersRef.add({
                        name: user.name || user.email?.split("@")[0] || "User",
                        email: user.email || null,
                        phone: null,
                        image: user.image || null,
                        role: UserRole.PATIENT,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        onboardingCompleted: false,
                        notificationPreferences: {
                            emailDonationReminders: true,
                            emailNewRequests: true,
                            emailEventUpdates: true,
                            inAppAlerts: true,
                        }
                    });
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
            }

            // Always fetch latest role from DB during JWT refresh or login
            if (token?.email) {
                const usersRef = adminDb.collection(COLLECTIONS.USERS);
                const snapshot = await usersRef.where("email", "==", token.email).limit(1).get();
                if (!snapshot.empty) {
                    const dbUser = snapshot.docs[0].data();
                    token.id = snapshot.docs[0].id;
                    token.role = dbUser.role;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

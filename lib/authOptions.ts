import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "./db/mongodb";
import { User } from "./models/User";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Phone Number",
            credentials: {
                phone: { label: "Phone Number", type: "text", placeholder: "017XXXXXXXX" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.password) {
                    throw new Error("Please enter phone and password");
                }

                await connectToDatabase();

                const user = await User.findOne({ phone: credentials.phone });

                if (!user) {
                    throw new Error("No user found with this phone number");
                }

                // In a real rural app, we might use OTP. 
                // For now, we'll use password or a simple bypass if in development.
                // For production, integrate with a real password hashing (bcrypt) or SMS service.

                // Simulating password check (add bcrypt comparison here)
                if (credentials.password !== "demo123") { // Temporary demo logic
                    // throw new Error("Invalid password");
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
        CredentialsProvider({
            id: "firebase",
            name: "Firebase",
            credentials: {
                email: { label: "Email", type: "text" },
                name: { label: "Name", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.email) return null;

                await connectToDatabase();
                let user = await User.findOne({ email: credentials.email });

                if (!user) {
                    user = await User.create({
                        name: credentials.name || credentials.email.split("@")[0],
                        email: credentials.email,
                        role: "patient",
                    });
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                await connectToDatabase();
                const existingUser = await User.findOne({ email: user.email });

                if (!existingUser) {
                    await User.create({
                        name: user.name || user.email?.split("@")[0] || "User",
                        email: user.email || undefined,
                        image: user.image || undefined,
                        role: "patient",
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
                await connectToDatabase();
                const dbUser = await User.findOne({ email: token.email });
                if (dbUser) {
                    token.id = dbUser._id.toString();
                    token.role = dbUser.role;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
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

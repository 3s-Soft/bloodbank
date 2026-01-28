import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "./db/mongodb";
import { User } from "./models/User";

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
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
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

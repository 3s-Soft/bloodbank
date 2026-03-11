import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "./db/mongodb";
import { User } from "./models/User";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

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

                await connectToDatabase();
                const user = await User.findOne({ phone: credentials.phone });

                if (!user) {
                    throw new Error("No user found with this phone number");
                }

                if (!user.password) {
                    throw new Error("User has no password set");
                }

                // Check bcrypt hash, fallback to plaintext comparison for legacy seed data
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password) || credentials.password === user.password;
                
                if (!isPasswordValid) {
                     throw new Error("Invalid password");
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

                await connectToDatabase();
                const user = await User.findOne({ email: credentials.email });

                if (!user) {
                    throw new Error("No user found with this email");
                }

                if (!user.password) {
                    throw new Error("User has no password set");
                }

                // Check bcrypt hash, fallback to plaintext comparison for legacy seed data
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password) || credentials.password === user.password;
                
                if (!isPasswordValid) {
                     throw new Error("Invalid password");
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
                        phone: undefined, // Explicitly undefined for optional unique field
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
                        phone: undefined, // Explicitly undefined for optional unique field
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
                session.user.id = token.id;
                session.user.role = token.role;
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

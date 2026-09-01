import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { DEFAULT_NOTIFICATION_PREFERENCES, UserRole } from "@/lib/db/enums";
import * as usersRepo from "@/lib/repositories/users";
import type { UserRow } from "@/lib/types";

/**
 * Verifies a password against the stored bcrypt hash.
 *
 * The previous implementation fell back to `credentials.password === user.password`
 * when the hash comparison failed, which let anyone log in as a user whose
 * password had been stored unhashed. That fallback is deliberately gone; every
 * account is seeded and created with a bcrypt hash.
 */
async function verifyPassword(plain: string, user: UserRow): Promise<boolean> {
    if (!user.password) return false;
    return bcrypt.compare(plain, user.password);
}

function toSessionUser(user: UserRow) {
    return {
        id: String(user.id),
        name: user.name,
        email: user.email ?? undefined,
        role: user.role,
    };
}

/**
 * Credentials providers return a deliberately vague error. Distinguishing
 * "no such account" from "wrong password" tells an attacker which phone numbers
 * and emails are registered.
 */
const INVALID_CREDENTIALS = "Invalid phone/email or password";

/**
 * Failed-attempt throttling for credentials sign-in.
 *
 * Same caveat as the API rate limiter: counters are per serverless instance and
 * reset on cold start, so this slows credential stuffing rather than stopping
 * it. It is keyed on the submitted identifier rather than the IP, so one
 * attacker cannot lock out an entire shared connection, and a successful login
 * clears the counter.
 */
const MAX_FAILED_ATTEMPTS = 8;
const LOCKOUT_MS = 15 * 60 * 1000;

const failedAttempts = new Map<string, { count: number; firstAt: number }>();

function assertNotLockedOut(identifier: string) {
    const record = failedAttempts.get(identifier);
    if (!record) return;

    if (Date.now() - record.firstAt > LOCKOUT_MS) {
        failedAttempts.delete(identifier);
        return;
    }

    if (record.count >= MAX_FAILED_ATTEMPTS) {
        throw new Error("Too many failed attempts. Please try again in a few minutes.");
    }
}

function recordFailure(identifier: string) {
    const record = failedAttempts.get(identifier);
    if (!record || Date.now() - record.firstAt > LOCKOUT_MS) {
        failedAttempts.set(identifier, { count: 1, firstAt: Date.now() });
        return;
    }
    record.count += 1;
}

function clearFailures(identifier: string) {
    failedAttempts.delete(identifier);
}

/**
 * Builds a credentials provider keyed on a single identifier.
 *
 * The phone and email providers differ only in which field they read, how it
 * is normalised, and which lookup they use. Expressing that as one factory
 * keeps the security-sensitive part -- lockout, password check, failure
 * recording -- in exactly one place, so it cannot drift between the two.
 */
function identifierProvider(options: {
    id: "phone" | "email";
    name: string;
    field: string;
    inputType: string;
    normalise: (raw: string) => string;
    lookup: (identifier: string) => Promise<UserRow | null>;
    missingMessage: string;
}) {
    return CredentialsProvider({
        id: options.id,
        name: options.name,
        credentials: {
            [options.field]: { label: options.name, type: options.inputType },
            password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
            const raw = credentials?.[options.field];
            if (!raw || !credentials?.password) {
                throw new Error(options.missingMessage);
            }

            const identifier = options.normalise(raw);
            const key = `${options.id}:${identifier}`;

            assertNotLockedOut(key);

            const user = await options.lookup(identifier);
            if (!user || !(await verifyPassword(credentials.password, user))) {
                recordFailure(key);
                throw new Error(INVALID_CREDENTIALS);
            }

            clearFailures(key);
            return toSessionUser(user);
        },
    });
}

export const authOptions: NextAuthOptions = {
    providers: [
        identifierProvider({
            id: "phone",
            name: "Phone Number",
            field: "phone",
            inputType: "text",
            normalise: (raw) => raw.trim(),
            lookup: (phone) => usersRepo.findByPhone(phone),
            missingMessage: "Enter your phone number and password",
        }),
        identifierProvider({
            id: "email",
            name: "Email Address",
            field: "email",
            inputType: "email",
            normalise: (raw) => raw.trim().toLowerCase(),
            lookup: (email) => usersRepo.findByEmail(email),
            missingMessage: "Enter your email and password",
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider !== "google" || !user.email) {
                return true;
            }

            await usersRepo.upsertGoogleUser({
                name: user.name || user.email.split("@")[0],
                email: user.email.toLowerCase(),
                image: user.image,
                defaultRole: UserRole.PATIENT,
                notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
            });

            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role ?? UserRole.PATIENT;
            }

            // Re-read on refresh so a role change by an admin takes effect
            // without forcing the user to log out. One indexed lookup.
            if (token.email) {
                const dbUser = await usersRepo.findByEmail(String(token.email).toLowerCase());
                if (dbUser) {
                    token.id = String(dbUser.id);
                    token.role = dbUser.role;
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role =
                    typeof token.role === "string" ? token.role : UserRole.PATIENT;
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

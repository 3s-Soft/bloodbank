/**
 * End-to-end smoke test against a running server.
 *
 *   npm run dev            # in one terminal
 *   npm run smoke          # in another
 *
 * Checks the paths that matter and, in particular, the ones that were broken or
 * unprotected before the MySQL rebuild: authorization on mutating routes, tenant
 * isolation, the donor upsert, and transactional donation recording.
 *
 * Assumes the demo seed (`npm run db:seed`). It creates a small amount of data
 * under a recognisable prefix and does not clean up: re-run the seed for a
 * pristine state.
 */

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const ORG = "savar-blood-bank";
const OTHER_ORG = "uttara-donors";
const ADMIN_PHONE = "01710000001";
const SUPER_ADMIN_EMAIL = "admin@bloodbank.org";
const PASSWORD = "demo123";

let passed = 0;
let failed = 0;

function check(label: string, ok: boolean, detail?: unknown) {
    if (ok) {
        passed += 1;
        console.log(`  PASS  ${label}`);
    } else {
        failed += 1;
        console.error(`  FAIL  ${label}${detail === undefined ? "" : ` -> ${JSON.stringify(detail)}`}`);
    }
}

/** Minimal cookie jar: enough to carry a NextAuth session between requests. */
class Session {
    private cookies = new Map<string, string>();

    private header(): string {
        return [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; ");
    }

    private absorb(response: Response) {
        for (const raw of response.headers.getSetCookie?.() ?? []) {
            const [pair] = raw.split(";");
            const index = pair.indexOf("=");
            if (index > 0) this.cookies.set(pair.slice(0, index), pair.slice(index + 1));
        }
    }

    async fetch(path: string, init: RequestInit = {}): Promise<Response> {
        const response = await fetch(`${BASE}${path}`, {
            ...init,
            headers: {
                ...(init.body ? { "Content-Type": "application/json" } : {}),
                ...(this.cookies.size ? { Cookie: this.header() } : {}),
                ...init.headers,
            },
            redirect: "manual",
        });
        this.absorb(response);
        return response;
    }

    async json<T>(path: string, init?: RequestInit): Promise<T> {
        const response = await this.fetch(path, init);
        const body = (await response.json()) as { data?: T };
        return body.data as T;
    }

    async status(path: string, init?: RequestInit): Promise<number> {
        return (await this.fetch(path, init)).status;
    }

    /** Signs in through a NextAuth credentials provider. */
    async login(provider: "phone" | "email", credentials: Record<string, string>) {
        const { csrfToken } = (await (await this.fetch("/api/auth/csrf")).json()) as {
            csrfToken: string;
        };

        await this.fetch(`/api/auth/callback/${provider}`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ csrfToken, ...credentials, json: "true" }).toString(),
        });

        const session = (await (await this.fetch("/api/auth/session")).json()) as {
            user?: { id: string; role: string };
        };
        return session.user ?? null;
    }
}

async function main() {
    console.log(`Smoke test against ${BASE}\n`);

    const anon = new Session();

    /* ---------------------------------------------------------- health */
    console.log("health");
    // The health endpoint deliberately returns a flat body rather than the
    // `{ data }` envelope, so uptime monitors can read it without unwrapping.
    const health = (await (await anon.fetch("/api/health")).json()) as {
        status: string;
        database: string;
    };
    check("health reports database connected", health?.database === "connected", health);

    /* ------------------------------------------------------ public reads */
    console.log("\npublic reads");
    const stats = await anon.json<{ donorsCount: number }>(`/api/org/stats?orgSlug=${ORG}`);
    check("org stats returns a donor count", typeof stats?.donorsCount === "number", stats);

    const donors = await anon.json<{ id: number; organizationId: number }[]>(
        `/api/donors?orgSlug=${ORG}`,
    );
    check("donor list is non-empty", donors.length > 0, donors.length);
    check("donors use numeric ids", donors.every((d) => typeof d.id === "number"));

    const otherDonors = await anon.json<{ organizationId: number }[]>(
        `/api/donors?orgSlug=${OTHER_ORG}`,
    );
    const orgIds = new Set([
        ...donors.map((d) => d.organizationId),
        ...otherDonors.map((d) => d.organizationId),
    ]);
    check("tenant isolation: two organizations, disjoint ids", orgIds.size === 2, [...orgIds]);

    check(
        "unknown organization returns 404",
        (await anon.status("/api/org/stats?orgSlug=zz-nonexistent")) === 404,
    );

    /* ------------------------------------------------------- validation */
    console.log("\nvalidation");
    check(
        "malformed donor registration is rejected",
        (await anon.status("/api/donors/register", {
            method: "POST",
            body: JSON.stringify({ name: "X", phone: "123", bloodGroup: "ZZ+", orgSlug: ORG }),
        })) === 400,
    );

    /* ---------------------------------------------------- authorization */
    console.log("\nauthorization (these routes were unauthenticated before the rebuild)");
    const guarded: [string, RequestInit][] = [
        ["/api/donors/verify", { method: "POST", body: JSON.stringify({ donorId: 1, isVerified: true, orgSlug: ORG }) }],
        ["/api/requests/status", { method: "POST", body: JSON.stringify({ requestId: 1, status: "fulfilled", orgSlug: ORG }) }],
        ["/api/org/settings", { method: "PUT", body: JSON.stringify({ orgSlug: ORG, name: "Nope" }) }],
        ["/api/org/users", { method: "POST", body: JSON.stringify({ name: "Mallory", phone: "01711112222", role: "admin", orgSlug: ORG }) }],
        ["/api/admin/organizations", { method: "GET" }],
        ["/api/admin/stats", { method: "GET" }],
    ];

    for (const [path, init] of guarded) {
        check(`${init.method} ${path} rejects anonymous`, (await anon.status(path, init)) === 401);
    }

    /* ------------------------------------------------------------ login */
    console.log("\nauthentication");
    const badLogin = new Session();
    const badUser = await badLogin.login("phone", { phone: ADMIN_PHONE, password: "wrong-password" });
    check("wrong password does not create a session", badUser === null, badUser);

    const admin = new Session();
    const adminUser = await admin.login("phone", { phone: ADMIN_PHONE, password: PASSWORD });
    check("org admin can sign in with phone", adminUser?.role === "admin", adminUser);

    const superAdmin = new Session();
    const superUser = await superAdmin.login("email", {
        email: SUPER_ADMIN_EMAIL,
        password: PASSWORD,
    });
    check("super admin can sign in with email", superUser?.role === "super_admin", superUser);

    /* -------------------------------------------------- privilege bounds */
    console.log("\nprivilege boundaries");
    check(
        "org admin cannot reach super-admin routes",
        (await admin.status("/api/admin/organizations")) === 403,
    );
    check(
        "org admin cannot edit another organization",
        (await admin.status("/api/org/settings", {
            method: "PUT",
            body: JSON.stringify({ orgSlug: OTHER_ORG, name: "Cross-tenant write" }),
        })) === 403,
    );

    const foreignDonor = (
        await anon.json<{ id: number }[]>(`/api/donors?orgSlug=${OTHER_ORG}`)
    )[0];
    check(
        "org admin cannot verify another organization's donor",
        (await admin.status("/api/donors/verify", {
            method: "POST",
            body: JSON.stringify({ donorId: foreignDonor.id, isVerified: true, orgSlug: ORG }),
        })) === 403,
    );

    /* ------------------------------------------------- donor upsert path */
    console.log("\ndonor registration");
    const phone = `017${String(Date.now()).slice(-8)}`;
    const first = await anon.json<{ userId: number; created: boolean }>("/api/donors/register", {
        method: "POST",
        body: JSON.stringify({
            name: "Smoke Donor",
            phone,
            bloodGroup: "B+",
            district: "Dhaka",
            upazila: "Savar",
            orgSlug: ORG,
        }),
    });
    check("first registration creates a user", first?.created === true, first);

    const second = await anon.json<{ userId: number; created: boolean }>("/api/donors/register", {
        method: "POST",
        body: JSON.stringify({
            name: "Smoke Donor",
            phone,
            bloodGroup: "AB-",
            district: "Dhaka",
            upazila: "Dhamrai",
            orgSlug: ORG,
        }),
    });
    check("second registration reuses the user", second?.created === false, second);
    check("same user id both times", first?.userId === second?.userId);

    const afterRegistration = await anon.json<
        { bloodGroup: string; user: { phone: string } | null }[]
    >(`/api/donors?orgSlug=${ORG}`);
    const mine = afterRegistration.filter((d) => d.user?.phone === phone);
    check("upsert did not duplicate the donor profile", mine.length === 1, mine.length);
    check("upsert updated the existing profile", mine[0]?.bloodGroup === "AB-", mine[0]?.bloodGroup);

    /* ------------------------------------------- transactional donation */
    console.log("\ndonation recording (transaction)");
    const target = mine[0] as unknown as { id: number; totalDonations: number; points: number };
    const donation = await admin.json<{ id: number }>("/api/donations", {
        method: "POST",
        body: JSON.stringify({
            donorProfileId: target.id,
            orgSlug: ORG,
            donationDate: new Date().toISOString().slice(0, 10),
            location: "Smoke Test Center",
        }),
    });
    check("donation recorded", typeof donation?.id === "number", donation);

    const afterDonation = (
        await anon.json<{ id: number; totalDonations: number; badges: string[] }[]>(
            `/api/donors?orgSlug=${ORG}`,
        )
    ).find((d) => d.id === target.id);
    check(
        "donor total incremented in the same transaction",
        afterDonation?.totalDonations === target.totalDonations + 1,
        afterDonation?.totalDonations,
    );
    check("badges recalculated", (afterDonation?.badges ?? []).includes("first_blood"), afterDonation?.badges);

    /* ------------------------------------------------------------ audit */
    console.log("\naudit trail");
    const logs = await admin.json<{ action: string; performedBy: { name: string } | null }[]>(
        `/api/org/audit-log?orgSlug=${ORG}&limit=5`,
    );
    check("audit entries exist", logs.length > 0, logs.length);
    check(
        "audit actor comes from the session",
        logs[0]?.performedBy?.name === "Savar Admin",
        logs[0]?.performedBy,
    );
    check(
        "audit actions are snake_case (dashboard keys off these)",
        logs.every((l) => /^[a-z_]+$/.test(l.action)),
        logs.map((l) => l.action),
    );

    /* ------------------------------------------------------- rate limit */
    console.log("\nrate limiting");
    const burst: number[] = [];
    for (let i = 0; i < 8; i += 1) {
        burst.push(
            await anon.status("/api/feedback", {
                method: "POST",
                body: JSON.stringify({
                    name: "Smoke Tester",
                    category: "general",
                    message: `Burst message ${i}`,
                }),
            }),
        );
    }
    check("a burst of submissions is throttled", burst.includes(429), burst);

    /* ---------------------------------------------------- super admin */
    console.log("\nsuper admin");
    const platform = await superAdmin.json<{ organizationsCount: number }>("/api/admin/stats");
    check("platform stats available", platform?.organizationsCount >= 3, platform);

    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
    console.error("Smoke test crashed:", error);
    process.exit(1);
});

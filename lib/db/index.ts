import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import * as schema from "./schema";

export * from "./schema";

/**
 * MySQL connection for a serverless runtime.
 *
 * The app runs on Vercel and the database is on Hostinger shared hosting, so
 * two constraints shape this file:
 *
 * 1. Each lambda instance holds its own connections, and shared hosting caps
 *    concurrent connections low. A normal pool would multiply into hundreds, so
 *    the pool is capped at one connection per instance and idle connections are
 *    released quickly.
 * 2. Every query is a public-internet round trip rather than a localhost call,
 *    so the connection is encrypted and timeouts are generous.
 *
 * The pool is cached on `globalThis` so warm invocations and Next dev
 * hot-reloads reuse it instead of leaking a new pool each time.
 */

declare global {
    var mysqlPool: mysql.Pool | undefined;
    var drizzleDb: MySql2Database<typeof schema> | undefined;
}

function readConnectionConfig(): mysql.PoolOptions {
    const poolLimit = Number(process.env.MYSQL_POOL_LIMIT ?? 1);

    const shared: mysql.PoolOptions = {
        // One connection per warm lambda keeps total connections proportional
        // to concurrent instances rather than concurrent requests.
        connectionLimit: Number.isFinite(poolLimit) && poolLimit > 0 ? poolLimit : 1,
        maxIdle: 1,
        idleTimeout: 10_000,
        connectTimeout: 10_000,
        enableKeepAlive: true,
        // Bangla content (organization names, donor names, lib/i18n/bn.ts)
        // requires the full 4-byte character set.
        charset: "utf8mb4",
        // Encrypts credentials and donor data in transit. Certificate
        // validation is disabled because shared hosting serves a self-signed
        // certificate; this still prevents passive interception, which an
        // unencrypted connection would not.
        ssl: { rejectUnauthorized: false },
        // Return DATETIME columns as JS Dates in the process timezone-free form
        // Drizzle expects.
        timezone: "Z",
    };

    if (process.env.DATABASE_URL) {
        return { ...shared, uri: process.env.DATABASE_URL };
    }

    const { MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

    if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_DATABASE) {
        throw new Error(
            "Database is not configured. Set DATABASE_URL, or MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD and MYSQL_DATABASE.",
        );
    }

    return {
        ...shared,
        host: MYSQL_HOST,
        port: MYSQL_PORT ? Number(MYSQL_PORT) : 3306,
        user: MYSQL_USER,
        password: MYSQL_PASSWORD,
        database: MYSQL_DATABASE,
    };
}

function createDb(): MySql2Database<typeof schema> {
    if (!globalThis.mysqlPool) {
        globalThis.mysqlPool = mysql.createPool(readConnectionConfig());
    }

    if (!globalThis.drizzleDb) {
        globalThis.drizzleDb = drizzle(globalThis.mysqlPool, {
            schema,
            mode: "default",
        });
    }

    return globalThis.drizzleDb;
}

/**
 * The connection is opened on first use rather than at import time.
 *
 * ES module imports are hoisted above statements, so a script that calls
 * `dotenv.config()` before importing this module would still evaluate it with
 * an empty environment. Deferring construction lets `scripts/seed.ts` and the
 * Drizzle CLI load `.env.local` themselves, and costs nothing in Next.js, where
 * the environment is already populated before any module runs.
 */
export const db: MySql2Database<typeof schema> = new Proxy(
    {} as MySql2Database<typeof schema>,
    {
        get(_target, property) {
            const instance = createDb();
            const value = Reflect.get(instance, property) as unknown;
            return typeof value === "function" ? value.bind(instance) : value;
        },
        has(_target, property) {
            return Reflect.has(createDb(), property);
        },
    },
);

/** Closes the pool. Only for scripts; long-running servers keep it open. */
export async function closeDb(): Promise<void> {
    if (globalThis.mysqlPool) {
        await globalThis.mysqlPool.end();
        globalThis.mysqlPool = undefined;
        globalThis.drizzleDb = undefined;
    }
}

export type Database = typeof db;

/**
 * The transaction handle passed to `db.transaction(...)` callbacks. Services
 * accept this so a repository call can participate in a caller's transaction.
 */
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

/** Either the pooled connection or an open transaction. */
export type DbExecutor = Database | Transaction;

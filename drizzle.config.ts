import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

/**
 * Migrations are generated and applied from a developer machine, never from
 * Vercel. The runtime database user therefore does not need DDL grants once the
 * initial migration has been applied.
 */
export default defineConfig({
    dialect: "mysql",
    schema: "./lib/db/schema.ts",
    out: "./drizzle",
    dbCredentials: process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
              host: process.env.MYSQL_HOST ?? "127.0.0.1",
              port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
              user: process.env.MYSQL_USER ?? "root",
              password: process.env.MYSQL_PASSWORD,
              database: process.env.MYSQL_DATABASE ?? "bloodbank",
              ssl: { rejectUnauthorized: false },
          },
    verbose: true,
    strict: true,
});

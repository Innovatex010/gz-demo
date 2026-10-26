import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schema } from "../../db/schema";

const globalForDb = globalThis as unknown as { db: ReturnType<typeof drizzle> };

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = globalForDb.db ?? drizzle(pool, { schema });

if (process.env.NODE_ENV !== "production") globalForDb.db = db;

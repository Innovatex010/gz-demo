/**
 * Drop all tables and enum types from the public schema.
 * Run with: bun scripts/drop-schema.js
 */
import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get all enum types in the public schema
    const enumRes = await client.query(`
      SELECT t.typname
      FROM pg_type t
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE n.nspname = 'public' AND t.typtype = 'e'
    `);
    const enums = enumRes.rows.map((r) => r.typname);

    // Get all tables in the public schema
    const tableRes = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `);
    const tables = tableRes.rows.map((r) => r.tablename);

    // Drop tables
    for (const t of tables) {
      // Using format to safely quote the identifier
      await client.query(`DROP TABLE IF EXISTS ${client.escapeIdentifier(t)} CASCADE`);
      console.log(`Dropped table: ${t}`);
    }

    // Drop enum types
    for (const e of enums) {
      await client.query(`DROP TYPE IF EXISTS ${client.escapeIdentifier(e)} CASCADE`);
      console.log(`Dropped enum: ${e}`);
    }

    await client.query("COMMIT");
    console.log(`\nDropped ${tables.length} tables and ${enums.length} enum types.`);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Error:", e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();

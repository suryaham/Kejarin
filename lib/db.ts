import { Pool, type QueryResultRow } from "pg";
import fs from "node:fs";
import path from "node:path";

declare global {
  var __kejarinPool: Pool | undefined;
  var __kejarinMigrated: Promise<void> | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL (atau POSTGRES_URL) belum diset. Lihat .env.example."
    );
  }
  return new Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
  });
}

export function getPool(): Pool {
  if (!global.__kejarinPool) {
    global.__kejarinPool = createPool();
  }
  return global.__kejarinPool;
}

async function migrate() {
  const pool = getPool();
  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  await pool.query(schema);
}

export function ensureMigrated(): Promise<void> {
  if (!global.__kejarinMigrated) {
    global.__kejarinMigrated = migrate();
  }
  return global.__kejarinMigrated;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  await ensureMigrated();
  const pool = getPool();
  return pool.query<T>(text, params);
}

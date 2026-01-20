import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Prioritize SUPABASE_DB_URL, fallback to DATABASE_URL if needed
const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Database connection string (SUPABASE_DB_URL or DATABASE_URL) must be set.",
  );
}

export const pool = new Pool({ 
  connectionString,
  ssl: connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : false
});
export const db = drizzle(pool, { schema });

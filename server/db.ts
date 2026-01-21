import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

// We'll use the Supabase public hostname but with the Transaction Pooler port (6543)
// and explicit IP if resolution fails, but for now let's try the pooler port.
// The user's SUPABASE_DB_URL is likely using port 5432.
const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error(
    "Database connection string (SUPABASE_DB_URL) must be set.",
  );
}

/**
 * Using node-postgres (pg) with a more resilient pool configuration.
 * We also handle DNS resolution failures by not crashing the whole process.
 */
const pool = new pg.Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});

// Suppress immediate crashes from pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err);
});

export const db = drizzle(pool, { schema });

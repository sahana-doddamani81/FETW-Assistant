import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Use the URL pooler connection string if possible, or ensure it's correct
const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error(
    "Database connection string (SUPABASE_DB_URL) must be set.",
  );
}

// Supabase often requires the transaction pooler (port 6543) or session pooler (port 5432)
// The ENOTFOUND error often happens in restricted environments if the hostname is not resolvable.
// We'll try to use the connection string directly and ensure we're not hitting a DNS cache issue.
const client = postgres(connectionString, { 
  ssl: 'require',
  prepare: false,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

export const db = drizzle(client, { schema });

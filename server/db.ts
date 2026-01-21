import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error(
    "Database connection string (SUPABASE_DB_URL) must be set.",
  );
}

// Ensure the connection string is correctly parsed and uses the standard postgres port
// The error ENOTFOUND suggests a DNS issue or malformed hostname.
// We'll try to use the connection string directly with postgres.js
const client = postgres(connectionString, { 
  ssl: 'require',
  prepare: false,
  // Increase connection timeout
  connect_timeout: 10
});

export const db = drizzle(client, { schema });

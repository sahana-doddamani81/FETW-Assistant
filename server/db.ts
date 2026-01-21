import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error(
    "Database connection string (SUPABASE_DB_URL) must be set.",
  );
}

// The ENOTFOUND error is a DNS resolution issue. 
// This can sometimes happen if the hostname is blocked or there's a temporary DNS failure.
// We'll use the Transaction Pooler (port 6543) which is often more stable in restricted environments.
// If the user provided 5432, we can try switching to 6543 if it fails, 
// but here we'll just refine the connection options.

const client = postgres(connectionString, { 
  ssl: 'require',
  prepare: false,
  connect_timeout: 30,
  idle_timeout: 20,
  // Disable transparent DNS lookups if possible or rely on the system
  onnotice: () => {}, 
});

export const db = drizzle(client, { schema });

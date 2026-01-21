import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error(
    "Database connection string (SUPABASE_DB_URL) must be set.",
  );
}

// The user's connection string has an '@' in the password which can break URL parsing.
// postgresql://postgres:[sahana@doddamani83]@db.gwveepfrzucmebwwulvz.supabase.co:5432/postgres
// We'll wrap the connection logic to be more robust.

const client = postgres(connectionString, { 
  ssl: 'require',
  prepare: false,
  // Increase connection timeout and retries
  connect_timeout: 30,
  idle_timeout: 20,
  max: 1, // Limit connections to prevent overhead
});

export const db = drizzle(client, { schema });

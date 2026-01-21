import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error(
    "Database connection string (SUPABASE_DB_URL) must be set.",
  );
}

// Fixed SSL and connection for Supabase
const client = postgres(connectionString, { 
  ssl: 'require',
  prepare: false 
});

export const db = drizzle(client, { schema });

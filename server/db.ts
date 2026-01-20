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

// Manual parsing for connection strings that might have brackets or special chars in password
let cleanConnectionString = connectionString.trim();

try {
  // Pattern: protocol://user:password@host:port/db
  // We need to carefully extract the password part especially if it has @ or brackets
  const protocolEnd = cleanConnectionString.indexOf("://");
  if (protocolEnd !== -1) {
    const protocol = cleanConnectionString.substring(0, protocolEnd + 3);
    const remaining = cleanConnectionString.substring(protocolEnd + 3);
    
    // Find the LAST '@' which separates credentials from host
    const atIndex = remaining.lastIndexOf("@");
    if (atIndex !== -1) {
      const credentials = remaining.substring(0, atIndex);
      const hostPortDb = remaining.substring(atIndex + 1);
      
      const colonIndex = credentials.indexOf(":");
      if (colonIndex !== -1) {
        const user = credentials.substring(0, colonIndex);
        let password = credentials.substring(colonIndex + 1);
        
        // Remove surrounding brackets if they exist
        password = password.replace(/^\[|\]$/g, "");
        
        // URL encode ONLY the password part
        cleanConnectionString = `${protocol}${user}:${encodeURIComponent(password)}@${hostPortDb}`;
      }
    }
  }
} catch (e) {
  // Fallback to original if parsing fails
}

// Ensure no [ ] are left in the host part either
cleanConnectionString = cleanConnectionString.replace(/%5B/g, "[").replace(/%5D/g, "]");
// But wait, the hostname itself should not have brackets. The brackets were likely around the password.
// Let's do a final safety check on the whole string to remove any literal brackets that might be breaking pg
cleanConnectionString = cleanConnectionString.replace(/\[|\]/g, "");

export const pool = new Pool({ 
  connectionString: cleanConnectionString,
  ssl: { rejectUnauthorized: false }
});
export const db = drizzle(pool, { schema });

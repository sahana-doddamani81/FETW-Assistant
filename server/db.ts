import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const connectionString = process.env.SUPABASE_DB_URL;

/**
 * Using node-postgres (pg) which often handles DNS resolution more robustly 
 * in certain environments.
 */
let dbInstance: any = null;

if (connectionString) {
  const pool = new pg.Pool({ 
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  // Suppress immediate crashes from pool errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  dbInstance = drizzle(pool, { schema });
}

export const db = dbInstance;

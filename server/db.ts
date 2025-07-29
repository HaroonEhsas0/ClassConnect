import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/tesla-schema";

neonConfig.webSocketConstructor = ws;

// Use a fallback database URL for development if not provided
const databaseUrl = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/amd_db';

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set. Using in-memory storage instead of database.');
}

export const pool = process.env.DATABASE_URL ? new Pool({ connectionString: databaseUrl }) : null;
export const db = process.env.DATABASE_URL ? drizzle({ client: pool!, schema }) : null;
import { Pool } from 'pg';
import { DATABASE_URL } from './index';

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }, 
});
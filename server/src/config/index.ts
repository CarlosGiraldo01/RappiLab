import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 4000;
export const DATABASE_URL = process.env.DATABASE_URL as string;
export const JWT_SECRET = process.env.JWT_SECRET as string;

if (!DATABASE_URL) throw new Error('No DATABASE_URL in .env');
if (!JWT_SECRET) throw new Error('No JWT_SECRET in .env');
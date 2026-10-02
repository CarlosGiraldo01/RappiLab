import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Boom from '@hapi/boom';
import { pool } from '../../config/database';
import { JWT_SECRET } from '../../config';
import { RegisterDTO, LoginDTO } from './authTypes';

function signToken(id: string, role: string) {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' });
}

export async function register(data: RegisterDTO) {
  const { name, email, password, role, storeName } = data;

  if (!name || !email || !password) {
    throw Boom.badRequest('name, email and password are required');
  }
  if (!['consumer', 'store', 'delivery'].includes(role)) {
    throw Boom.badRequest('role must be consumer, store or delivery');
  }

  if (role === 'store' && !storeName) {
    throw Boom.badRequest('storeName is required for the store role');
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw Boom.conflict('A user with that email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
      [name, email, passwordHash, role]
    );
    const user = userResult.rows[0];

    if (role === 'store') {
      await client.query(
        `INSERT INTO stores (name, is_open, user_owner_id) VALUES ($1, false, $2)`,
        [storeName, user.id]
      );
    }

    await client.query('COMMIT');

    const token = signToken(user.id, user.role);
    return { token, user };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function login(data: LoginDTO) {
  const { email, password } = data;

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) throw Boom.unauthorized('Invalid credentials');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw Boom.unauthorized('Invalid credentials');

  const token = signToken(user.id, user.role);
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}
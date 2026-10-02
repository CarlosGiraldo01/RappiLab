import Boom from '@hapi/boom';
import { pool } from '../../config/database';

export async function getOpenStores() {
  const result = await pool.query(
    'SELECT id, name, is_open FROM stores WHERE is_open = true ORDER BY name'
  );
  return result.rows;
}

export async function getMyStore(userId: string) {
  const result = await pool.query('SELECT * FROM stores WHERE user_owner_id = $1', [userId]);
  const store = result.rows[0];
  if (!store) throw Boom.notFound('No store found for this user');
  return store;
}

export async function toggleMyStore(userId: string) {
  const store = await getMyStore(userId);
  const result = await pool.query(
    'UPDATE stores SET is_open = NOT is_open WHERE id = $1 RETURNING *',
    [store.id]
  );
  return result.rows[0];
}
import Boom from '@hapi/boom';
import { pool } from '../../config/database';

export async function getProductsByStore(storeId: string) {
  const result = await pool.query(
    'SELECT id, name, price, store_id FROM products WHERE store_id = $1 ORDER BY name',
    [storeId]
  );
  return result.rows;
}

async function getStoreIdForOwner(userId: string) {
  const result = await pool.query('SELECT id FROM stores WHERE user_owner_id = $1', [userId]);
  const store = result.rows[0];
  if (!store) throw Boom.notFound('No store found for this user');
  return store.id as string;
}

export async function createProduct(userId: string, name: string, price: number) {

  if (!name || !name.trim()) {
    throw Boom.badRequest('Product name is required');
  }
  if (!Number.isInteger(price) || price < 0) {
    throw Boom.badRequest('Price must be a whole number of 0 or more');
  }

  const storeId = await getStoreIdForOwner(userId);

  const result = await pool.query(
    'INSERT INTO products (name, price, store_id) VALUES ($1, $2, $3) RETURNING *',
    [name, price, storeId]
  );
  return result.rows[0];
}

export async function updateProductName(userId: string, productId: string, name: string) {

  if (!name || !name.trim()) {
    throw Boom.badRequest('Product name is required');
  }

  const storeId = await getStoreIdForOwner(userId);

  const result = await pool.query(
    'UPDATE products SET name = $1 WHERE id = $2 AND store_id = $3 RETURNING *',
    [name, productId, storeId]
  );

  if (result.rows.length === 0) {
    throw Boom.notFound('Product not found for this store');
  }
  return result.rows[0];
}
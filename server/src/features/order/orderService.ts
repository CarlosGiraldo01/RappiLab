import Boom from '@hapi/boom';
import { pool } from '../../config/database';
import { CreateOrderDTO } from './orderTypes';

const ORDER_SELECT = `
  SELECT o.*, s.name AS store_name, u.name AS client_name
  FROM orders o
  JOIN stores s ON s.id = o.store_id
  JOIN users u ON u.id = o.client_id`;

async function attachItems(order: any) {
  const itemsResult = await pool.query(
    `SELECT oi.id, oi.quantity, p.id AS product_id, p.name, p.price
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [order.id]
  );
  return { ...order, items: itemsResult.rows };
}

export async function createOrder(clientId: string, data: CreateOrderDTO) {
  const { storeId, items } = data;

  if (!items || items.length === 0) {
    throw Boom.badRequest('The order must have at least one item');
  }

  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw Boom.badRequest('Each quantity must be a whole number greater than 0');
    }
  }

  const storeResult = await pool.query('SELECT is_open FROM stores WHERE id = $1', [storeId]);
  const store = storeResult.rows[0];
  if (!store) throw Boom.notFound('Store not found');
  if (!store.is_open) throw Boom.badRequest('This store is currently closed');

  const productIds = items.map((item) => item.productId);
  const found = await pool.query(
    'SELECT id FROM products WHERE store_id = $1 AND id = ANY($2::uuid[])',
    [storeId, productIds]
  );
  if (found.rows.length !== new Set(productIds).size) {
    throw Boom.badRequest('Some products do not belong to this store');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      `INSERT INTO orders (client_id, store_id, status)
       VALUES ($1, $2, 'waiting_for_deliver') RETURNING *`,
      [clientId, storeId]
    );
    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
        [order.id, item.productId, item.quantity]
      );
    }

    await client.query('COMMIT');
    return attachItems(order);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getMyOrders(clientId: string) {
  const result = await pool.query(
    `${ORDER_SELECT} WHERE o.client_id = $1 ORDER BY o.created_at DESC`,
    [clientId]
  );
  return Promise.all(result.rows.map(attachItems));
}

async function getStoreIdForOwner(userId: string) {
  const result = await pool.query('SELECT id FROM stores WHERE user_owner_id = $1', [userId]);
  const store = result.rows[0];
  if (!store) throw Boom.notFound('No store found for this user');
  return store.id as string;
}

export async function getStoreOrders(userId: string) {
  const storeId = await getStoreIdForOwner(userId);
  const result = await pool.query(
    `${ORDER_SELECT} WHERE o.store_id = $1 ORDER BY o.created_at DESC`,
    [storeId]
  );
  return Promise.all(result.rows.map(attachItems));
}

export async function getAvailableOrders() {
  const result = await pool.query(
    `${ORDER_SELECT} WHERE o.status = 'waiting_for_deliver' ORDER BY o.created_at ASC`
  );
  return Promise.all(result.rows.map(attachItems));
}

export async function getMyDeliveries(deliveryId: string) {
  const result = await pool.query(
    `${ORDER_SELECT} WHERE o.delivery_id = $1 ORDER BY o.created_at DESC`,
    [deliveryId]
  );
  return Promise.all(result.rows.map(attachItems));
}

export async function acceptOrder(deliveryId: string, orderId: string) {
  const result = await pool.query(
    `UPDATE orders SET delivery_id = $1, status = 'in_progress'
     WHERE id = $2 AND status = 'waiting_for_deliver'
     RETURNING *`,
    [deliveryId, orderId]
  );

  if (result.rows.length === 0) {
    const check = await pool.query('SELECT id FROM orders WHERE id = $1', [orderId]);
    if (check.rows.length === 0) throw Boom.notFound('Order not found');
    throw Boom.conflict('This order has already been taken by another delivery rider');
  }

  return attachItems(result.rows[0]);
}

export async function releaseOrder(deliveryId: string, orderId: string) {
  const result = await pool.query(
    `UPDATE orders SET delivery_id = NULL, status = 'waiting_for_deliver'
     WHERE id = $1 AND delivery_id = $2 AND status = 'in_progress'
     RETURNING *`,
    [orderId, deliveryId]
  );

  if (result.rows.length === 0) {
    throw Boom.forbidden('This order is not in progress or is not assigned to you');
  }
  return attachItems(result.rows[0]);
}

export async function markDelivered(deliveryId: string, orderId: string) {
  const result = await pool.query(
    `UPDATE orders SET status = 'delivered'
     WHERE id = $1 AND delivery_id = $2 AND status = 'in_progress'
     RETURNING *`,
    [orderId, deliveryId]
  );

  if (result.rows.length === 0) {
    throw Boom.forbidden('This order is not in progress or is not assigned to you');
  }
  return attachItems(result.rows[0]);
}
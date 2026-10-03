'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/lib/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, ApiError } from '@/lib/apiClient';
import { StatusBadge } from '@/lib/components/StatusBadge';
import { Store, Product, Order } from '@/lib/types';

export default function StoreAdminPage() {
  return (
    <ProtectedRoute allowedRole="store">
      <StoreDashboard />
    </ProtectedRoute>
  );
}

function StoreDashboard() {
  const { user, logout } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadProducts(storeId: string) {
    const data = await apiFetch<Product[]>(`/api/products/store/${storeId}`);
    setProducts(data);
  }

  async function loadAll(silent = false) {
    try {
      const storeData = await apiFetch<Store>('/api/stores/me');
      setStore(storeData);
      await loadProducts(storeData.id);
      const orderData = await apiFetch<Order[]>('/api/orders/store');
      setOrders(orderData);
    } catch (err) {
      if (!silent) setError(err instanceof ApiError ? err.message : 'Failed to load store data');
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => loadAll(true), 5000);
    return () => clearInterval(interval);
  }, []);

  async function toggleOpen() {
    setBusy(true);
    setError('');
    try {
      const updated = await apiFetch<Store>('/api/stores/me/toggle', { method: 'PATCH' });
      setStore(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to toggle store');
    } finally {
      setBusy(false);
    }
  }

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!store) return;
    setError('');
    try {
      await apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: newName, price: Number(newPrice) }),
      });
      setNewName('');
      setNewPrice('');
      await loadProducts(store.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create product');
    }
  }

  async function saveProductName(productId: string) {
    const name = editing[productId];
    if (!name) return;
    setError('');
    try {
      await apiFetch(`/api/products/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      });
      if (store) await loadProducts(store.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update product');
    }
  }

  if (!store) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-ink-soft">{error || 'Loading...'}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-semibold text-ink">Welcome, {user?.name}</h1>
          <button onClick={logout} className="btn-secondary">Log out</button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-primary-soft bg-primary-soft px-4 py-3 text-sm text-primary-dark">
            {error}
          </div>
        )}

        <section className="surface-card flex items-center justify-between px-6 py-5 mb-10">
          <div>
            <p className="font-display text-xl font-semibold text-ink mb-2">{store.name}</p>
            <span className={`badge ${store.is_open ? 'bg-success-soft text-success' : 'bg-pending-soft text-ink-soft'}`}>
              <span className="h-2 w-2 rounded-[3px] bg-current" />
              {store.is_open ? 'Open' : 'Closed'}
            </span>
          </div>
          <button onClick={toggleOpen} disabled={busy} className={store.is_open ? 'btn-secondary' : 'btn-primary'}>
            {store.is_open ? 'Close store' : 'Open store'}
          </button>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-xl font-semibold text-ink mb-4">Products</h2>

          <form onSubmit={createProduct} className="surface-card flex flex-wrap items-end gap-3 px-5 py-4 mb-5">
            <div className="flex-1 min-w-[160px]">
              <label className="block text-sm text-ink-soft mb-1">Name</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Product name" required className="input-field" />
            </div>
            <div className="w-32">
              <label className="block text-sm text-ink-soft mb-1">Price</label>
              <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0" required className="input-field" />
            </div>
            <button type="submit" className="btn-primary">Add product</button>
          </form>

          {products.length === 0 ? (
            <div className="surface-card border-dashed px-6 py-8 text-center text-ink-soft">
              No products yet. Add your first one above.
            </div>
          ) : (
            <div className="scroll-row">
              {products.map((product) => (
                <div key={product.id} className="surface-card min-w-[220px] shrink-0 px-5 py-4">
                  <input
                    value={editing[product.id] ?? product.name}
                    onChange={(e) => setEditing((prev) => ({ ...prev, [product.id]: e.target.value }))}
                    className="input-field mb-3"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-soft">${product.price.toLocaleString()}</span>
                    <button onClick={() => saveProductName(product.id)} className="btn-secondary px-4 py-1.5">Save</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink mb-4">Orders</h2>
          {orders.length === 0 ? (
            <div className="surface-card border-dashed px-6 py-8 text-center text-ink-soft">No orders yet.</div>
          ) : (
            <div className="scroll-row">
              {orders.map((order) => (
                <div key={order.id} className="surface-card min-w-[240px] shrink-0 px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-ink">#{order.id.slice(0, 8)}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <ul className="flex flex-col gap-1 text-sm text-ink-soft">
                    {order.items.map((item) => (
                      <li key={item.id}>{item.quantity}x {item.name}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
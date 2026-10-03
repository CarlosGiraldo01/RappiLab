'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/lib/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, ApiError } from '@/lib/apiClient';
import { StatusBadge } from '@/lib/components/StatusBadge';
import { Store, Product, Order } from '@/lib/types';

export default function ClientHomePage() {
  return (
    <ProtectedRoute allowedRole="consumer">
      <ClientDashboard />
    </ProtectedRoute>
  );
}

function ClientDashboard() {
  const { user, logout } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadStores(silent = false) {
    try {
      const data = await apiFetch<Store[]>('/api/stores/open');
      setStores(data);
    } catch (err) {
      if (!silent) setError(err instanceof ApiError ? err.message : 'Failed to load stores');
    }
  }

  async function loadMyOrders(silent = false) {
    try {
      const data = await apiFetch<Order[]>('/api/orders/my');
      setOrders(data);
    } catch (err) {
      if (!silent) setError(err instanceof ApiError ? err.message : 'Failed to load orders');
    }
  }

  useEffect(() => {
    loadStores();
    loadMyOrders();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadStores(true);
      loadMyOrders(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function selectStore(store: Store) {
    setSelectedStore(store);
    setCart({});
    setError('');
    try {
      const data = await apiFetch<Product[]>(`/api/products/store/${store.id}`);
      setProducts(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load products');
    }
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart((prev) => {
      const next = { ...prev };
      if (quantity <= 0) delete next[productId];
      else next[productId] = quantity;
      return next;
    });
  }

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [productId, qty]) => {
    const product = products.find((p) => p.id === productId);
    return sum + (product ? product.price * qty : 0);
  }, 0);
  const storeIsOpen = selectedStore ? stores.some((store) => store.id === selectedStore.id) : false;

  async function submitOrder() {
    if (!selectedStore) return;
    const items = Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity }));
    if (items.length === 0) {
      setError('Add at least one product before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ storeId: selectedStore.id, items }),
      });
      setSelectedStore(null);
      setProducts([]);
      setCart({});
      await loadMyOrders();
      await loadStores();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
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

        {!selectedStore && (
          <section className="mb-10">
            <h2 className="font-display text-xl font-semibold text-ink mb-4">Open stores</h2>
            {stores.length === 0 ? (
              <div className="surface-card border-dashed px-6 py-8 text-center text-ink-soft">
                No stores are open right now. Check back soon.
              </div>
            ) : (
              <div className="scroll-row">
                {stores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => selectStore(store)}
                    className="surface-card min-w-55 shrink-0 px-5 py-5 text-left hover:border-primary transition-colors"
                  >
                    <span className="badge bg-success-soft text-success mb-3">
                      <span className="h-2 w-2 rounded-[3px] bg-current" />
                      Open
                    </span>
                    <p className="font-display text-lg font-semibold text-ink mb-1">{store.name}</p>
                    <p className="text-sm text-ink-soft">View menu</p>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {selectedStore && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-ink">{selectedStore.name}</h2>
              <button onClick={() => setSelectedStore(null)} className="btn-ghost">Back to stores</button>
            </div>

            <div className="flex flex-col gap-3 mb-5">
              {products.map((product) => (
                <div key={product.id} className="surface-card flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="font-medium text-ink">{product.name}</p>
                    <p className="text-sm text-ink-soft">${product.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-full border border-border px-2 py-1">
                    <button
                      onClick={() => updateQuantity(product.id, (cart[product.id] ?? 0) - 1)}
                      disabled={!cart[product.id]}
                      className="stepper-btn"
                    >
                      −
                    </button>
                    <span className="w-4 text-center text-sm font-medium text-ink">{cart[product.id] ?? 0}</span>
                    <button
                      onClick={() => updateQuantity(product.id, (cart[product.id] ?? 0) + 1)}
                      className="stepper-btn"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!storeIsOpen && (
              <div className="mb-3 rounded-xl border border-primary-soft bg-primary-soft px-4 py-3 text-sm text-primary-dark">
                This store is currently closed. You cannot place orders.
              </div>
            )}

            <div className="surface-card flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm text-ink-soft">{cartCount} item{cartCount === 1 ? '' : 's'}</p>
                <p className="font-display text-lg font-semibold text-ink">${cartTotal.toLocaleString()}</p>
              </div>
              <button onClick={submitOrder} disabled={submitting || !storeIsOpen || cartCount === 0} className="btn-primary">
                {submitting ? 'Placing order...' : 'Place order'}
              </button>
            </div>
          </section>
        )}

        <section>
          <h2 className="font-display text-xl font-semibold text-ink mb-4">My orders</h2>
          {orders.length === 0 ? (
            <div className="surface-card border-dashed px-6 py-8 text-center text-ink-soft">
              You have not placed any orders yet.
            </div>
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
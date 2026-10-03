'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/lib/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, ApiError } from '@/lib/apiClient';
import { StatusBadge } from '@/lib/components/StatusBadge';
import { Order } from '@/lib/types';

export default function DeliveryPage() {
  return (
    <ProtectedRoute allowedRole="delivery">
      <DeliveryDashboard />
    </ProtectedRoute>
  );
}

function DeliveryDashboard() {
  const { user, logout } = useAuth();
  const [available, setAvailable] = useState<Order[]>([]);
  const [mine, setMine] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejected, setRejected] = useState<string[]>([]);

  async function loadAll(silent = false) {
    try {
      const availableData = await apiFetch<Order[]>('/api/orders/available');
      setAvailable(availableData);
      const mineData = await apiFetch<Order[]>('/api/orders/delivery/mine');
      setMine(mineData);
    } catch (err) {
      if (!silent) setError(err instanceof ApiError ? err.message : 'Failed to load orders');
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => loadAll(true), 5000);
    return () => clearInterval(interval);
  }, []);

  async function runAction(orderId: string, action: 'accept' | 'release' | 'deliver') {
    setBusyId(orderId);
    setError('');
    try {
      await apiFetch(`/api/orders/${orderId}/${action}`, { method: 'PATCH' });
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Failed to ${action} order`);
      await loadAll(true);
    } finally {
      setBusyId(null);
    }
  }

  const visibleAvailable = available.filter((order) => !rejected.includes(order.id));

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

        <section className="mb-10">
          <h2 className="font-display text-xl font-semibold text-ink mb-4">Available orders</h2>
          {visibleAvailable.length === 0 ? (
            <div className="surface-card border-dashed px-6 py-8 text-center text-ink-soft">
              No orders available right now.
            </div>
          ) : (
            <div className="scroll-row">
              {visibleAvailable.map((order) => (
                <div key={order.id} className="surface-card min-w-[240px] shrink-0 px-5 py-4">
                  <p className="font-medium text-ink">#{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-ink-soft mb-3">{order.store_name}</p>
                  <ul className="flex flex-col gap-1 text-sm text-ink-soft mb-4">
                    {order.items.map((item) => (
                      <li key={item.id}>{item.quantity}x {item.name}</li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <button onClick={() => setRejected((prev) => [...prev, order.id])} className="btn-secondary flex-1">
                      Reject
                    </button>
                    <button onClick={() => runAction(order.id, 'accept')} disabled={busyId === order.id} className="btn-primary flex-1">
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink mb-4">My deliveries</h2>
          {mine.length === 0 ? (
            <div className="surface-card border-dashed px-6 py-8 text-center text-ink-soft">
              You have not taken any orders yet.
            </div>
          ) : (
            <div className="scroll-row">
              {mine.map((order) => (
                <div key={order.id} className="surface-card min-w-[240px] shrink-0 px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-ink">#{order.id.slice(0, 8)}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <ul className="flex flex-col gap-1 text-sm text-ink-soft mb-4">
                    {order.items.map((item) => (
                      <li key={item.id}>{item.quantity}x {item.name}</li>
                    ))}
                  </ul>
                  {order.status === 'in_progress' && (
                    <div className="flex gap-2">
                      <button onClick={() => runAction(order.id, 'release')} disabled={busyId === order.id} className="btn-secondary flex-1">
                        Release
                      </button>
                      <button onClick={() => runAction(order.id, 'deliver')} disabled={busyId === order.id} className="btn-primary flex-1">
                        Mark delivered
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
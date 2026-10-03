'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/apiClient';
import { Role, ROLE_ROUTES } from '@/lib/roles';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('consumer');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await register({
        name,
        email,
        password,
        role,
        storeName: role === 'store' ? storeName : undefined,
      });
      router.push(ROLE_ROUTES[user.role]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-ink">Register</h1>
        </div>

        <div className="surface-card px-8 py-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-ink-soft mb-1.5">
                Name
              </label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="input-field" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-soft mb-1.5">
                Email
              </label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-soft mb-1.5">
                Password
              </label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field" />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-ink-soft mb-1.5">
                Role
              </label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value as Role)} className="input-field">
                <option value="consumer">Consumer</option>
                <option value="store">Store</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            {role === 'store' && (
              <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-ink-soft mb-1.5">
                  Store name
                </label>
                <input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-primary-soft bg-primary-soft px-4 py-3 text-sm text-primary-dark">
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3 mt-1">
              {submitting ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-soft mt-6">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-primary hover:text-primary-dark">
            Log in here
          </a>
        </p>
      </div>
    </main>
  );
}
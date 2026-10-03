'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/apiClient';
import { ROLE_ROUTES } from '@/lib/roles';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login({ email, password });
      router.push(ROLE_ROUTES[user.role]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-ink">Log in</h1>
        </div>

        <div className="surface-card px-8 py-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-soft mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-soft mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-primary-soft bg-primary-soft px-4 py-3 text-sm text-primary-dark">
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3 mt-1">
              {submitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-soft mt-6">
          No account?{' '}
          <a href="/register" className="font-medium text-primary hover:text-primary-dark">
            Register here
          </a>
        </p>
      </div>
    </main>
  );
}
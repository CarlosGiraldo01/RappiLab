'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLE_ROUTES } from '@/lib/roles';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? ROLE_ROUTES[user.role] : '/login');
  }, [user, loading, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>Loading...</p>
    </main>
  );
}
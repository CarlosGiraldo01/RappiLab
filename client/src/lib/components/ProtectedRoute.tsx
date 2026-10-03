'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Role, ROLE_ROUTES } from '@/lib/roles';

export function ProtectedRoute({
  allowedRole,
  children,
}: {
  allowedRole: Role;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== allowedRole) {
      router.replace(ROLE_ROUTES[user.role]);
    }
  }, [user, loading, allowedRole, router]);

  if (loading || !user || user.role !== allowedRole) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
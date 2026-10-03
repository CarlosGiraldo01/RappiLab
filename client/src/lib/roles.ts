export type Role = 'consumer' | 'store' | 'delivery';

export const ROLE_ROUTES: Record<Role, string> = {
  consumer: '/client',
  store: '/store-admin',
  delivery: '/delivery',
};

export function isValidRole(value: string): value is Role {
  return value === 'consumer' || value === 'store' || value === 'delivery';
}
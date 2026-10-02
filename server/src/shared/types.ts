export type Role = 'consumer' | 'store' | 'delivery';
export type OrderStatus = 'waiting_for_deliver' | 'in_progress' | 'delivered';

export interface AuthUser {
  id: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
import { Role } from './roles';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: Role;
  storeName?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface Store {
  id: string;
  name: string;
  is_open: boolean;
  user_owner_id?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  store_id: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  product_id: string;
  name: string;
  price: number;
}

export type OrderStatus = 'waiting_for_deliver' | 'in_progress' | 'delivered';

export interface Order {
  id: string;
  client_id: string;
  delivery_id: string | null;
  store_id: string;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
  store_name?: string;
  client_name?: string;
}
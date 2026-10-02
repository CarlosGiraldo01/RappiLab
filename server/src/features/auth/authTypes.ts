import { Role } from '../../shared/types';

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

export type UserRole = 'operario' | 'admin';

export interface User {
  id: string;
  nombre: string;
  legajo?: string; 
  role: UserRole;
}

export interface Product {
  id: string;
  nombre: string;
  precioPorKg: number;   
  maxKgPorPersona: number;
  isActive: boolean;        
}

export type OrderStatus = 'pendiente' | 'hecho' | 'cancelado';

export interface OrderItem {
  productId: string;
  cantidadKg: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string; // ISO date
}

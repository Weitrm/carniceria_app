export type UserRole = "operario" | "admin";

export interface User {
  id: string;
  nombre: string;
  legajo?: string;
  email?: string;
  role: UserRole;
}

export type SessionUser = Pick<User, "id" | "nombre" | "role">;

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  funcionario: string;
  password: string;
  role: UserRole;
}

export interface Product {
  id: string;
  nombre: string;
  precioPorKg: number;
  maxKgPorPersona: number;
  isActive: boolean;
}

export type ProductInput = Omit<Product, "id">;

export type OrderStatus = "pendiente" | "preparacion" | "hecho" | "entregado" | "cancelado";

export interface OrderItem {
  productId: string;
  cantidadKg: number;
}

export type OrderInput = {
  userId: string;
  items: OrderItem[];
};

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string; // ISO date
}

export type CartLine = OrderItem & {
  product: Product;
  subtotal: number;
};

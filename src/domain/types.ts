
// Rol del usuario

export type UserRole = 'admin' | 'operario';

// Interfaz de usuario

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

// Interfaz de productos
export interface Product {
    id: string;
    name: string;
    price: number;
    unit: 'kg' | 'unidad';
    weeklyLimitPerUser?: number;
    isActive: boolean;
}

// Interfaz pedido
export interface OrderItem {
    productId: string;
    quantity: number;
}

// Interfaz de pedido realizado 

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    createdAt: string;
    weekKey: string;
}














































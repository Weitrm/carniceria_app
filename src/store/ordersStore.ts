import { create } from "zustand";
import type { Order, OrderInput, OrderItem, OrderStatus } from "../lib/types";

const ORDERS_STORAGE_KEY = "carniceria_orders";

type OrdersState = {
  orders: Order[];
  addOrder: (data: OrderInput) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
};

const DEFAULT_ORDERS: Order[] = [
  {
    id: "order-001",
    userId: "operario-001",
    items: [
      { productId: "prod-001", cantidadKg: 2 },
      { productId: "prod-002", cantidadKg: 1 },
    ],
    status: "pendiente",
    createdAt: new Date(Date.now()).toISOString(),
  },
  {
    id: "order-002",
    userId: "operario-002",
    items: [{ productId: "prod-003", cantidadKg: 3 }],
    status: "hecho",
    createdAt: new Date(Date.now()).toISOString(),
  },
];

const persistOrders = (orders: Order[]) => {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
};

const loadOrders = (): Order[] => {
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) return DEFAULT_ORDERS;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ORDERS;
  } catch {
    return DEFAULT_ORDERS;
  }
};

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `order-${Math.random().toString(36).slice(2, 8)}`;

export const ordersStore = create<OrdersState>((set) => ({
  orders: loadOrders(),
  addOrder: (data) =>
    set((state) => {
      const sanitizedItems = data.items.filter((item) => item.cantidadKg > 0);
      if (sanitizedItems.length === 0) return state;
      const order: Order = {
        id: createId(),
        userId: data.userId,
        items: sanitizedItems,
        status: "pendiente",
        createdAt: new Date().toISOString(),
      };
      const orders = [order, ...state.orders];
      persistOrders(orders);
      return { orders };
    }),
  updateStatus: (id, status) =>
    set((state) => {
      const orders = state.orders.map((order) =>
        order.id === id ? { ...order, status } : order
      );
      persistOrders(orders);
      return { orders };
    }),
}));

export default ordersStore;

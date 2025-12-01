import { create } from "zustand";
import type { Order, OrderInput, OrderStatus } from "../lib/types";

const ORDERS_STORAGE_KEY = "carniceria_orders";

type OrdersState = {
  orders: Order[];
  addOrder: (data: OrderInput) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
};

const DEFAULT_ORDERS: Order[] = [];

const persistOrders = (orders: Order[]) => {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
};

const loadOrders = (): Order[] => {
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) return DEFAULT_ORDERS;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_ORDERS;
    return parsed.map((order) => ({
      ...order,
      updatedAt: order.updatedAt ?? order.createdAt ?? new Date().toISOString(),
    }));
  } catch {
    return DEFAULT_ORDERS;
  }
};

const createId = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase(); // 5 chars legibles
  return `ORD-${yyyy}${mm}${dd}-${suffix}`;
};

export const ordersStore = create<OrdersState>((set) => ({
  orders: loadOrders(),
  addOrder: (data) =>
    set((state) => {
      const sanitizedItems = data.items.filter((item) => item.cantidadKg > 0);
      if (sanitizedItems.length === 0) return state;
      const now = new Date().toISOString();
      const order: Order = {
        id: createId(),
        userId: data.userId,
        items: sanitizedItems,
        status: "pendiente",
        createdAt: now,
        updatedAt: now,
      };
      const orders = [order, ...state.orders];
      persistOrders(orders);
      return { orders };
    }),
  updateStatus: (id, status) =>
    set((state) => {
      const now = new Date().toISOString();
      const orders = state.orders.map((order) =>
        order.id === id ? { ...order, status, updatedAt: now } : order
      );
      persistOrders(orders);
      return { orders };
    }),
}));

export default ordersStore;

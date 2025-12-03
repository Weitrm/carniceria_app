import { create } from "zustand";
import type { Order, OrderInput, OrderStatus } from "../lib/types";

const ORDERS_STORAGE_KEY = "carniceria_orders";
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const DEFAULT_ORDERS: Order[] = [];

type OrderBlock = {
  order: Order;
  nextAllowedAt: string;
};

type AddOrderResult =
  | {
      success: true;
      order: Order;
    }
  | {
      success: false;
      reason: string;
      blockingOrder?: Order;
    };

type OrdersState = {
  orders: Order[];
  addOrder: (data: OrderInput) => AddOrderResult;
  updateStatus: (id: string, status: OrderStatus) => void;
  getOrderBlock: (userId: string) => OrderBlock | null;
};

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

const findOrderBlock = (orders: Order[], userId: string): OrderBlock | null => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const nowDay = todayStart.getTime();

  const latest = [...orders]
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  if (!latest) return null;
  if (latest.status === "cancelado") return null;

  const created = new Date(latest.createdAt);
  if (Number.isNaN(created.getTime())) return null;
  created.setHours(0, 0, 0, 0);
  const createdDay = created.getTime();
  const nextAllowedMs = createdDay + ONE_WEEK_MS;

  if (nowDay < nextAllowedMs) {
    return {
      order: latest,
      nextAllowedAt: new Date(nextAllowedMs).toISOString(),
    };
  }
  return null;
};

export const ordersStore = create<OrdersState>((set, get) => ({
  orders: loadOrders(),
  addOrder: (data) => {
    const sanitizedItems = data.items.filter((item) => item.cantidadKg > 0);
    if (sanitizedItems.length === 0) {
      return { success: false, reason: "Agrega productos con cantidad mayor a 0." };
    }

    const pendingBlock = findOrderBlock(get().orders, data.userId);
    if (pendingBlock) {
      return {
        success: false,
        reason: "Ya tienes un pedido en proceso. Podras enviar otro cuando pasen 7 dias o se cancele.",
        blockingOrder: pendingBlock.order,
      };
    }

    const now = new Date().toISOString();
    const order: Order = {
      id: createId(),
      userId: data.userId,
      items: sanitizedItems,
      status: "pendiente",
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const orders = [order, ...state.orders];
      persistOrders(orders);
      return { orders };
    });
    return { success: true, order };
  },
  updateStatus: (id, status) =>
    set((state) => {
      const now = new Date().toISOString();
      const orders = state.orders.map((order) =>
        order.id === id ? { ...order, status, updatedAt: now } : order
      );
      persistOrders(orders);
      return { orders };
    }),
  getOrderBlock: (userId) => findOrderBlock(get().orders, userId),
}));

export default ordersStore;

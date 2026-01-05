import { create } from "zustand";
import type { Order, OrderInput, OrderStatus } from "../lib/types";
import { LocalOrdersRepository } from "../lib/repositories/ordersRepository";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

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
  addOrderAsync: (data: OrderInput) => Promise<AddOrderResult>;
  updateStatusAsync: (id: string, status: OrderStatus) => Promise<void>;
  refresh: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
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

const repository = new LocalOrdersRepository();

export const ordersStore = create<OrdersState>((set, get) => ({
  orders: repository.load(),
  isLoading: false,
  error: null,
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
      repository.save(orders);
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
      repository.save(orders);
      return { orders };
    }),
  getOrderBlock: (userId) => findOrderBlock(get().orders, userId),
  refresh: async () => {
    set({ isLoading: true, error: null });
    try {
      const orders = await repository.list();
      set({ orders });
    } catch (error) {
      set({ error: "No se pudieron cargar los pedidos" });
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },
  addOrderAsync: async (data) => {
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

    const nextOrders = [order, ...get().orders];
    set({ orders: nextOrders });
    await repository.persist(nextOrders);
    return { success: true, order };
  },
  updateStatusAsync: async (id, status) => {
    const now = new Date().toISOString();
    const nextOrders = get().orders.map((order) =>
      order.id === id ? { ...order, status, updatedAt: now } : order
    );
    set({ orders: nextOrders });
    await repository.persist(nextOrders);
  },
}));

export default ordersStore;

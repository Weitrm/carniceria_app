import { create } from "zustand";
import type { Order, OrderInput, OrderPolicy, OrderStatus } from "../lib/types";
import { LocalOrdersRepository } from "../lib/repositories/ordersRepository";
import {
  defaultPolicyForUser,
  findNextAllowedDate,
  formatAllowedDays,
  isDayAllowed,
} from "../lib/orderPolicies";
import orderPoliciesStore from "./orderPoliciesStore";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type OrderBlock = {
  type: "day" | "limit";
  order?: Order;
  nextAllowedAt?: string;
  reason: string;
  policy: OrderPolicy;
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

const policyForUser = (userId: string): OrderPolicy =>
  orderPoliciesStore.getState().getPolicy(userId) ?? defaultPolicyForUser(userId);

const findDayBlock = (policy: OrderPolicy): OrderBlock | null => {
  if (isDayAllowed(policy)) return null;
  const nextDate = findNextAllowedDate(policy);
  const allowedText = formatAllowedDays(policy.allowedDays);
  return {
    type: "day",
    policy,
    nextAllowedAt: nextDate?.toISOString(),
    reason: `No puede enviar pedidos hoy. Dias habilitados: ${allowedText}.`,
  };
};

const findLimitBlock = (
  orders: Order[],
  userId: string,
  policy: OrderPolicy
): OrderBlock | null => {
  if (policy.maxOrdersPerWeek === null) return null;
  if (policy.maxOrdersPerWeek === 0) {
    return {
      type: "limit",
      policy,
      reason: "Este usuario tiene los pedidos deshabilitados.",
    };
  }
  const now = Date.now();
  const weekAgo = now - ONE_WEEK_MS;
  const relevant = orders
    .filter((o) => o.userId === userId && o.status !== "cancelado")
    .filter((o) => {
      const created = new Date(o.createdAt).getTime();
      if (Number.isNaN(created)) return false;
      return created >= weekAgo;
    });
  if (relevant.length >= policy.maxOrdersPerWeek) {
    const ordered = [...relevant].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const oldest = ordered[0];
    const latest = ordered[ordered.length - 1];
    const nextAllowedAt = new Date(new Date(oldest.createdAt).getTime() + ONE_WEEK_MS).toISOString();
    const limitLabel =
      policy.maxOrdersPerWeek === 1
        ? "1 pedido cada 7 dias"
        : `${policy.maxOrdersPerWeek} pedidos cada 7 dias`;
    return {
      type: "limit",
      policy,
      order: latest,
      nextAllowedAt,
      reason: `Limite de ${limitLabel} alcanzado.`,
    };
  }
  return null;
};

const findOrderBlock = (orders: Order[], userId: string): OrderBlock | null => {
  const policy = policyForUser(userId);
  return findDayBlock(policy) ?? findLimitBlock(orders, userId, policy);
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
        reason: pendingBlock.reason,
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
        reason: pendingBlock.reason,
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

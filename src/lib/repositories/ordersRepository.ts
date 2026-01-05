import type { Order, OrderStatus } from "../types";
import { httpClient } from "../http";

const ORDERS_STORAGE_KEY = "carniceria_orders";
const DEFAULT_ORDERS: Order[] = [];

export interface OrdersRepository {
  load(): Order[];
  save(orders: Order[]): void;
  list(): Promise<Order[]>;
  persist(orders: Order[]): Promise<void>;
}

export class LocalOrdersRepository implements OrdersRepository {
  load(): Order[] {
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
  }

  save(orders: Order[]) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }

  async list(): Promise<Order[]> {
    return this.load();
  }

  async persist(orders: Order[]): Promise<void> {
    this.save(orders);
  }
}

type ApiOrder = Order;

export class OrdersApiRepository implements OrdersRepository {
  load(): Order[] {
    throw new Error("Use list() with API repository");
  }

  save(): void {
    throw new Error("Use persist() with API repository");
  }

  async list(): Promise<Order[]> {
    const { data } = await httpClient.get<ApiOrder[]>("/orders");
    return data.map((order) => ({
      ...order,
      updatedAt: order.updatedAt ?? order.createdAt ?? new Date().toISOString(),
    }));
  }

  async persist(orders: Order[]): Promise<void> {
    // For API mode, assume optimistic bulk replace is not desired.
    // This is a placeholder to keep interface parity; individual actions should be used instead.
    await httpClient.post("/orders/bulk", orders);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const { data } = await httpClient.patch<ApiOrder>(`/orders/${id}`, { status });
    return data;
  }

  async create(order: Omit<Order, "id" | "updatedAt">): Promise<Order> {
    const { data } = await httpClient.post<ApiOrder>("/orders", order);
    return data;
  }
}

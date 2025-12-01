import { create } from "zustand";
import type { OrderItem } from "../lib/types";

const CART_STORAGE_KEY = "carniceria_cart";

type CartState = {
  items: OrderItem[];
  addItem: (item: OrderItem, maxKg: number) => void;
  updateCantidad: (productId: string, cantidadKg: number, maxKg: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const persistCart = (items: OrderItem[]) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

const totalKg = (items: OrderItem[]) =>
  items.reduce((sum, item) => sum + item.cantidadKg, 0);

const loadCart = (): OrderItem[] => {
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const cartStore = create<CartState>((set) => ({
  items: loadCart(),
  addItem: (item, maxKg) =>
    set((state) => {
      const existing = state.items.find((it) => it.productId === item.productId);
      // Limite: máximo 2 productos distintos
      if (!existing && state.items.length >= 2) return state;

      const currentTotal = totalKg(state.items);
      const currentQty = existing?.cantidadKg ?? 0;
      const totalWithoutProduct = currentTotal - currentQty;
      // Limite global: máximo 8 kg sumando todos los productos
      const remainingKg = Math.max(0, 8 - totalWithoutProduct);
      const maxForProduct = Math.min(maxKg, remainingKg);
      if (maxForProduct <= 0) return state;

      if (existing) {
        const mergedQty = Math.min(existing.cantidadKg + item.cantidadKg, maxForProduct);
        const items = state.items.map((it) =>
          it.productId === item.productId ? { ...it, cantidadKg: mergedQty } : it
        );
        persistCart(items);
        return { items };
      }
      const items = [
        ...state.items,
        { ...item, cantidadKg: Math.min(item.cantidadKg, maxForProduct) },
      ];
      persistCart(items);
      return { items };
    }),
  updateCantidad: (productId, cantidadKg, maxKg) =>
    set((state) => {
      const target = state.items.find((it) => it.productId === productId);
      if (!target) return state;
      const cappedRequested = Math.max(0, Math.min(cantidadKg, maxKg));
      const totalWithoutProduct = totalKg(state.items) - target.cantidadKg;
      const allowedQty = Math.max(0, Math.min(cappedRequested, 8 - totalWithoutProduct));
      const nextQty = allowedQty;
      const items = state.items
        .map((it) => (it.productId === productId ? { ...it, cantidadKg: nextQty } : it))
        .filter((it) => it.cantidadKg > 0);
      persistCart(items);
      return { items };
    }),
  removeItem: (productId) =>
    set((state) => {
      const items = state.items.filter((it) => it.productId !== productId);
      persistCart(items);
      return { items };
    }),
  clear: () => {
    persistCart([]);
    set({ items: [] });
  },
}));

export default cartStore;

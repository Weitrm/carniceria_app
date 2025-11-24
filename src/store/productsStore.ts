
import { create } from "zustand";
import type { Product } from "../lib/types";

const PRODUCTS_STORAGE_KEY = "carniceria_products";

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    nombre: "Bife Angosto",
    precioPorKg: 7800,
    maxKgPorPersona: 3,
    isActive: true,
  },
  {
    id: "prod-002",
    nombre: "Vacio",
    precioPorKg: 6900,
    maxKgPorPersona: 2,
    isActive: true,
  },
  {
    id: "prod-003",
    nombre: "Asado",
    precioPorKg: 5200,
    maxKgPorPersona: 4,
    isActive: true,
  },
];

type ProductInput = Omit<Product, "id">;

type ProductsState = {
  products: Product[];
  addProduct: (data: ProductInput) => void;
  updateProduct: (id: string, data: ProductInput) => void;
  toggleActive: (id: string) => void;
  removeProduct: (id: string) => void;
};

const persistProducts = (products: Product[]) => {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
};

const loadProducts = (): Product[] => {
  const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
  if (!raw) return DEFAULT_PRODUCTS;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
  }
};

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `prod-${Math.random().toString(36).slice(2, 8)}`;

export const productsStore = create<ProductsState>((set) => ({
  products: loadProducts(),
  addProduct: (data) =>
    set((state) => {
      const product: Product = {
        ...data,
        id: createId(),
        isActive: data.isActive ?? true,
      };
      const products = [...state.products, product];
      persistProducts(products);
      return { products };
    }),
  updateProduct: (id, data) =>
    set((state) => {
      const products = state.products.map((product) =>
        product.id === id ? { ...product, ...data } : product
      );
      persistProducts(products);
      return { products };
    }),
  toggleActive: (id) =>
    set((state) => {
      const products = state.products.map((product) =>
        product.id === id ? { ...product, isActive: !product.isActive } : product
      );
      persistProducts(products);
      return { products };
    }),
  removeProduct: (id) =>
    set((state) => {
      const products = state.products.filter((p) => p.id !== id);
      persistProducts(products);
      return { products };
    }),
}));

export default productsStore;

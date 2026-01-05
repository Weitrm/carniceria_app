import { create } from "zustand";
import type { Product, ProductInput } from "../lib/types";
import { LocalProductsRepository } from "../lib/repositories/productsRepository";

type ProductsState = {
  products: Product[];
  addProduct: (data: ProductInput) => void;
  updateProduct: (id: string, data: ProductInput) => void;
  toggleActive: (id: string) => void;
  removeProduct: (id: string) => void;
  addProductAsync: (data: ProductInput) => Promise<void>;
  updateProductAsync: (id: string, data: ProductInput) => Promise<void>;
  toggleActiveAsync: (id: string) => Promise<void>;
  removeProductAsync: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `prod-${Math.random().toString(36).slice(2, 8)}`;

const repository = new LocalProductsRepository();

export const productsStore = create<ProductsState>((set, get) => ({
  products: repository.load(),
  isLoading: false,
  error: null,
  addProduct: (data) =>
    set((state) => {
      const product: Product = {
        ...data,
        id: createId(),
        isActive: data.isActive ?? true,
      };
      const products = [...state.products, product];
      repository.save(products);
      return { products };
    }),
  updateProduct: (id, data) =>
    set((state) => {
      const products = state.products.map((product) =>
        product.id === id ? { ...product, ...data } : product
      );
      repository.save(products);
      return { products };
    }),
  toggleActive: (id) =>
    set((state) => {
      const products = state.products.map((product) =>
        product.id === id ? { ...product, isActive: !product.isActive } : product
      );
      repository.save(products);
      return { products };
    }),
  removeProduct: (id) =>
    set((state) => {
      const products = state.products.filter((p) => p.id !== id);
      repository.save(products);
      return { products };
    }),
  refresh: async () => {
    set({ isLoading: true, error: null });
    try {
      const products = await repository.list();
      set({ products });
    } catch (error) {
      console.error(error);
      set({ error: "No se pudieron cargar los productos" });
    } finally {
      set({ isLoading: false });
    }
  },
  addProductAsync: async (data) => {
    const product: Product = {
      ...data,
      id: createId(),
      isActive: data.isActive ?? true,
    };
    const next = [...get().products, product];
    set({ products: next });
    await repository.persist(next);
  },
  updateProductAsync: async (id, data) => {
    const next = get().products.map((product) =>
      product.id === id ? { ...product, ...data } : product
    );
    set({ products: next });
    await repository.persist(next);
  },
  toggleActiveAsync: async (id) => {
    const next = get().products.map((product) =>
      product.id === id ? { ...product, isActive: !product.isActive } : product
    );
    set({ products: next });
    await repository.persist(next);
  },
  removeProductAsync: async (id) => {
    const next = get().products.filter((p) => p.id !== id);
    set({ products: next });
    await repository.persist(next);
  },
}));

export default productsStore;

import type { Product, ProductInput } from "../types";
import { httpClient } from "../http";

const PRODUCTS_STORAGE_KEY = "carniceria_products";

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    nombre: "Bife Angosto",
    codigo: "998170",
    precioPorKg: 7800,
    maxKgPorPersona: 3,
    isActive: true,
  },
  {
    id: "prod-002",
    nombre: "Vacio",
    codigo: "998165",
    precioPorKg: 6900,
    maxKgPorPersona: 2,
    isActive: true,
  },
  {
    id: "prod-003",
    nombre: "Asado",
    codigo: "998160",
    precioPorKg: 5200,
    maxKgPorPersona: 4,
    isActive: true,
  },
];

export interface ProductsRepository {
  load(): Product[];
  save(products: Product[]): void;
  list(): Promise<Product[]>;
  persist(products: Product[]): Promise<void>;
}

export class LocalProductsRepository implements ProductsRepository {
  load(): Product[] {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) return DEFAULT_PRODUCTS;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed.map((product) => ({
            ...product,
            codigo: product.codigo == null ? "" : String(product.codigo),
          }))
        : DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  }

  save(products: Product[]) {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }

  async list(): Promise<Product[]> {
    return this.load();
  }

  async persist(products: Product[]): Promise<void> {
    this.save(products);
  }
}

type ApiProduct = Product;

export class ProductsApiRepository implements ProductsRepository {
  load(): Product[] {
    throw new Error("Use list() with API repository");
  }

  save(): void {
    throw new Error("Use persist() with API repository");
  }

  async list(): Promise<Product[]> {
    const { data } = await httpClient.get<ApiProduct[]>("/products");
    return data;
  }

  async persist(products: Product[]): Promise<void> {
    // Placeholder for bulk sync; prefer granular calls.
    await httpClient.post("/products/bulk", products);
  }

  async create(payload: ProductInput): Promise<Product> {
    const { data } = await httpClient.post<ApiProduct>("/products", payload);
    return data;
  }

  async update(id: string, payload: Partial<ProductInput>): Promise<Product> {
    const { data } = await httpClient.patch<ApiProduct>(`/products/${id}`, payload);
    return data;
  }

  async toggle(id: string): Promise<Product> {
    const { data } = await httpClient.post<ApiProduct>(`/products/${id}/toggle`);
    return data;
  }

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/products/${id}`);
  }
}

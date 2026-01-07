import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AppShell } from "../../components/layout/AppShell";
import { SessionHeader } from "../../components/shared/SessionHeader";
import productsStore from "../../store/productsStore";
import type { Product } from "../../lib/types";

type ProductFormValues = {
  nombre: string;
  codigo: string;
  precioPorKg: number;
  maxKgPorPersona: number;
  isActive: boolean;
};

const currencyFormat = (value: number) =>
  new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);

export const AdminProductsPage = () => {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, toggleActive, removeProduct,} = productsStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "activos" | "inactivos">("todos");
  const { register, handleSubmit, reset, watch } = useForm<ProductFormValues>({
    defaultValues: {
      nombre: "",
      codigo: "",
      precioPorKg: 0,
      maxKgPorPersona: 1,
      isActive: true,
    },
  });

  const editingProduct = useMemo<Product | undefined>(
    () => products.find((p) => p.id === editingId),
    [editingId, products]
  );

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return products
      .filter((p) => {
        if (statusFilter === "activos") return p.isActive;
        if (statusFilter === "inactivos") return !p.isActive;
        return true;
      })
      .filter((p) => {
        if (!searchValue) return true;
        return (
          p.nombre.toLowerCase().includes(searchValue) ||
          p.codigo.toLowerCase().includes(searchValue)
        );
      });
  }, [products, search, statusFilter]);

  useEffect(() => {
    if (editingProduct) {
      reset({
        nombre: editingProduct.nombre,
        codigo: editingProduct.codigo,
        precioPorKg: editingProduct.precioPorKg,
        maxKgPorPersona: editingProduct.maxKgPorPersona,
        isActive: editingProduct.isActive,
      });
    } else {
      reset({
        nombre: "",
        codigo: "",
        precioPorKg: 0,
        maxKgPorPersona: 1,
        isActive: true,
      });
    }
  }, [editingProduct, reset]);

  const onSubmit = handleSubmit((values) => {
    const payload = {
      nombre: values.nombre.trim(),
      codigo: values.codigo.trim(),
      precioPorKg: Number(values.precioPorKg),
      maxKgPorPersona: Number(values.maxKgPorPersona),
      isActive: values.isActive,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }

    setEditingId(null);
    reset({
      nombre: "",
      codigo: "",
      precioPorKg: 0,
      maxKgPorPersona: 1,
      isActive: true,
    });
  });

  
  return (
    <AppShell>
      <SessionHeader />
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100/60">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
              Admin
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Gestion de productos</h1>
            <p className="mt-1 text-sm text-slate-600">
              Crea, edita o desactiva cortes disponibles para los operarios.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            <button
              onClick={() => navigate("/admin")}
              className="w-full rounded-lg border border-rose-100 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 sm:w-auto"
            >
              Volver al inicio
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="w-full rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 sm:w-auto"
            >
              Nuevo producto
            </button>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 flex justify-center">
            <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Lista de productos
                  </p>
                  <p className="text-sm text-slate-600">
                    {filteredProducts.length} / {products.length} configurados
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                  />
                  {(["todos", "activos", "inactivos"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`rounded-full px-3 py-1 font-semibold transition ${
                        statusFilter === status
                          ? "bg-rose-600 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:text-rose-700"
                      }`}
                    >
                      {status === "todos" ? "Todos" : status}
                    </button>
                  ))}
                  <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 flex items-center">
                    {products.filter((p) => p.isActive).length} Activos
                  </span>
                </div>
              </div>
              {products.length === 0 ? (
                <div className="p-6 text-sm text-slate-600">
                  Aun no hay productos cargados. Usa el formulario para crear el primer corte.
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-6 text-sm text-slate-600">
                  No se encontraron productos con esos filtros.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[820px] divide-y divide-slate-100 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Codigo</th>
                        <th className="px-4 py-3">Precio/kg</th>
                        <th className="px-4 py-3">Max kg/persona</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-rose-50/40">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {product.nombre}
                          </td>
                          <td className="px-4 py-3 text-slate-700">{product.codigo}</td>
                          <td className="px-4 py-3 text-slate-700">
                            {currencyFormat(product.precioPorKg)}
                          </td>
                          <td className="px-4 py-3 text-slate-700">{product.maxKgPorPersona} kg</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                product.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {product.isActive ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              <button
                                onClick={() => setEditingId(product.id)}
                                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-600"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => toggleActive(product.id)}
                                className={`rounded-lg px-3 py-1 text-xs font-semibold shadow-sm transition ${
                                  product.isActive
                                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                }`}
                              >
                                {product.isActive ? "Desactivar" : "Activar"}
                              </button>
                              <button
                                onClick={() => removeProduct(product.id)}
                                className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
              {editingProduct ? "Editar producto" : "Nuevo producto"}
            </p>
            <h2 className="text-lg font-bold text-slate-900">
              {editingProduct ? editingProduct.nombre : "Agregar corte"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Define nombre, precio y limite por persona. El estado activo controla si se muestra al operario.
            </p>

            <form className="mt-4 space-y-4" onSubmit={onSubmit}>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Nombre</label>
                <input
                  type="text"
                  {...register("nombre", { required: true })}
                  className="w-full rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                  placeholder="Ej: Asado de tira"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Codigo</label>
                <input
                  type="text"
                  inputMode="numeric"
                  {...register("codigo", { required: true })}
                  className="w-full rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                  placeholder="Ej: 998160"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Precio por kg</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("precioPorKg", { valueAsNumber: true, required: true })}
                    className="w-full rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Max kg/persona</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    {...register("maxKgPorPersona", { valueAsNumber: true, required: true })}
                    className="w-full rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                    placeholder="Ej: 2"
                  />
                </div>
              </div>

              <label className="flex items-center justify-between rounded-lg border border-rose-100 bg-white px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Disponible</p>
                  <p className="text-xs text-slate-600">
                    Si esta activo, se muestra en la vista del operario.
                  </p>
                </div>
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="h-5 w-5 rounded border-slate-300 text-rose-600 focus:ring-rose-400"
                />
              </label>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-600 sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 sm:w-auto"
                >
                  {editingProduct ? "Guardar cambios" : "Crear producto"}
                </button>
              </div>
            </form>

            <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
              Vista previa: {watch("nombre") || "Nuevo producto"} | Codigo{" "}
              {watch("codigo") || "Sin codigo"} |{" "}
              {watch("precioPorKg") ? currencyFormat(watch("precioPorKg")) : "$0"} | Max{" "}
              {watch("maxKgPorPersona")} kg | {watch("isActive") ? "Activo" : "Inactivo"}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
};

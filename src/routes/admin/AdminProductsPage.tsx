import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AppShell } from "../../components/layout/AppShell";
import { SessionHeader } from "../../components/shared/SessionHeader";
import productsStore from "../../store/productsStore";
import type { Product } from "../../lib/types";

type ProductFormValues = {
  nombre: string;
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
  const { products, addProduct, updateProduct, toggleActive, removeProduct,} = productsStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const { register, handleSubmit, reset, watch } = useForm<ProductFormValues>({
    defaultValues: {
      nombre: "",
      precioPorKg: 0,
      maxKgPorPersona: 1,
      isActive: true,
    },
  });

  const editingProduct = useMemo<Product | undefined>(
    () => products.find((p) => p.id === editingId),
    [editingId, products]
  );

  useEffect(() => {
    if (editingProduct) {
      reset({
        nombre: editingProduct.nombre,
        precioPorKg: editingProduct.precioPorKg,
        maxKgPorPersona: editingProduct.maxKgPorPersona,
        isActive: editingProduct.isActive,
      });
    } else {
      reset({
        nombre: "",
        precioPorKg: 0,
        maxKgPorPersona: 1,
        isActive: true,
      });
    }
  }, [editingProduct, reset]);

  const onSubmit = handleSubmit((values) => {
    const payload = {
      nombre: values.nombre.trim(),
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
      precioPorKg: 0,
      maxKgPorPersona: 1,
      isActive: true,
    });
  });

  return (
    <AppShell>
      <SessionHeader />
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100/60">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
              Admin
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Gestion de productos</h1>
            <p className="mt-1 text-sm text-slate-600">
              Crea, edita o desactiva cortes disponibles para los operarios.
            </p>
          </div>
          <button
            onClick={() => setEditingId(null)}
            className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700"
          >
            Nuevo producto
          </button>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Lista de productos
                  </p>
                  <p className="text-sm text-slate-600">
                    {products.length} {products.length === 1 ? "corte" : "cortes"} configurados
                  </p>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {products.filter((p) => p.isActive).length} activos
                </div>
              </div>

              {products.length === 0 ? (
                <div className="p-6 text-sm text-slate-600">
                  Aun no hay productos cargados. Usa el formulario para crear el primer corte.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Precio/kg</th>
                        <th className="px-4 py-3">Max kg/persona</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-rose-50/40">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {product.nombre}
                          </td>
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
                            <div className="flex justify-end gap-2">
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

              <div className="grid grid-cols-2 gap-3">
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

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
                >
                  {editingProduct ? "Guardar cambios" : "Crear producto"}
                </button>
              </div>
            </form>

            <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
              Vista previa: {watch("nombre") || "Nuevo producto"} por{" "}
              {watch("precioPorKg") ? currencyFormat(watch("precioPorKg")) : "$0"} | Max{" "}
              {watch("maxKgPorPersona")} kg | {watch("isActive") ? "Activo" : "Inactivo"}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
};

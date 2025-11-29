import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { SessionHeader } from "../../components/shared/SessionHeader";
import productsStore from "../../store/productsStore";
import cartStore from "../../store/cartStore";

const currencyFormat = (value: number) =>
  new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);

export const UserProductsPage = () => {
  const navigate = useNavigate();
  const products = productsStore((s) => s.products);
  const addToCart = cartStore((s) => s.addItem);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const activeProducts = products.filter((p) => p.isActive);

  const handleAdd = (productId: string, maxKg: number) => {
    addToCart({ productId, cantidadKg: 1 }, maxKg);
    setLastAdded(productId);
  };

  return (
    <AppShell>
      <SessionHeader />
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100/60">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
              Catalogo
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Productos disponibles</h1>
            <p className="mt-1 text-sm text-slate-600">
              Revisa los cortes y agrega al carrito lo que necesitas para tu pedido.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Operario
            </span>
            <span className="text-xs text-slate-500">
              {activeProducts.length} activos / {products.length} totales
            </span>
            <button
              onClick={() => navigate("/user/cart")}
              className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 sm:w-auto"
            >
              Ir al carrito
            </button>
          </div>
        </header>

        {lastAdded && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span>
              Producto agregado al carrito. Puedes seguir agregando o revisar tu pedido.
            </span>
            <button
              onClick={() => navigate("/user/cart")}
              className="w-full rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
            >
              Ir al carrito
            </button>
          </div>
        )}

        {activeProducts.length === 0 ? (
          <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 text-sm text-slate-700 shadow-sm">
            No hay productos activos. Cuando el administrador active cortes, apareceran aqui.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeProducts.map((product) => (
              <article
                key={product.id}
                className="flex h-full flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{product.nombre}</h2>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase text-emerald-700">
                    Activo
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Max {product.maxKgPorPersona} kg por persona
                </p>
                <p className="mt-2 text-2xl font-bold text-rose-700">
                  {currencyFormat(product.precioPorKg)} <span className="text-sm text-slate-500">/kg</span>
                </p>
                <div className="mt-4 flex flex-1 items-end">
                  <button
                    onClick={() => handleAdd(product.id, product.maxKgPorPersona)}
                    className="w-full rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
                  >
                    Agregar al carrito
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
};

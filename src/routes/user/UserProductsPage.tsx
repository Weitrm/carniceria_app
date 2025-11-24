import { AppShell } from "../../components/layout/AppShell";
import { SessionHeader } from "../../components/shared/SessionHeader";

export const UserProductsPage = () => {
  return (
    <AppShell>
      <SessionHeader />
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100/60">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
              Catalogo
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Productos disponibles</h1>
            <p className="mt-1 text-sm text-slate-600">
              Revisa los cortes y agrega al carrito lo que necesitas para tu pedido.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Operario
          </span>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-700 shadow-sm">
            Usa este espacio para mostrar tarjetas de productos con precios y disponibilidad.
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-700 shadow-sm">
            Al hacer clic en un producto, podras sumarlo al carrito y continuar al pedido.
          </div>
        </div>
      </section>
    </AppShell>
  );
};

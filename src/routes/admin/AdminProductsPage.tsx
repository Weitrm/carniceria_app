import { AppShell } from "../../components/layout/AppShell";
import { SessionHeader } from "../../components/shared/SessionHeader";

export const AdminProductsPage = () => {
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
          <button className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700">
            Nuevo producto
          </button>
        </header>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-700 shadow-sm lg:col-span-2">
            Cuando agregues productos, mostrara una tabla con nombre, stock y precio para cada item.
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-800 shadow-inner">
            Sugerencia: usa este panel para cargar imagenes y etiquetas por tipo de corte.
          </div>
        </div>
      </section>
    </AppShell>
  );
};

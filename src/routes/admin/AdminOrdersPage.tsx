import { AppShell } from "../../components/layout/AppShell";
import { SessionHeader } from "../../components/shared/SessionHeader";

export const AdminOrdersPage = () => {
  return (
    <AppShell>
      <SessionHeader />
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100/60">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
              Admin
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Pedidos pendientes</h1>
            <p className="mt-1 text-sm text-slate-600">
              Revisa los pedidos enviados por los operarios y actualiza su estado.
            </p>
          </div>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            Panel admin
          </span>
        </header>

        <div className="mt-6 grid gap-4">
          <div className="rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-700 shadow-sm">
            Aun no hay pedidos registrados.
          </div>
          <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-4 text-sm text-rose-800 shadow-inner">
            Agregar filtros por estado (pendiente, en preparacion, entregado) y acciones rapidas para cada pedido.
          </div>
        </div>
      </section>
    </AppShell>
  );
};

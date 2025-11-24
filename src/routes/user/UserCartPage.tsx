import { AppShell } from "../../components/layout/AppShell";
import { SessionHeader } from "../../components/shared/SessionHeader";

export const UserCartPage = () => {
  return (
    <AppShell>
      <SessionHeader />
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100/60">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
              Carrito
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Resumen de pedido</h1>
            <p className="mt-1 text-sm text-slate-600">
              Confirma cantidades antes de enviar al administrador para su preparacion.
            </p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            En revision
          </span>
        </header>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-700 shadow-sm lg:col-span-2">
            Aun no hay productos en el carrito. Regresa al catalogo y agrega los cortes para este pedido.
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-800 shadow-inner">
            Cuando tengas items listos, aqui veras el total y un boton para enviar la solicitud.
          </div>
        </div>
      </section>
    </AppShell>
  );
};

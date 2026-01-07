import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { SessionHeader } from "../../components/shared/SessionHeader";

const adminSections = [
  {
    title: "Pedidos",
    description: "Revisa pedidos entrantes y actualiza su estado.",
    action: "/admin/orders",
    badge: "Seguimiento",
    tone: "bg-rose-50 border-rose-100 text-rose-700",
  },
  {
    title: "Productos",
    description: "Activa, edita o crea cortes disponibles para los operarios.",
    action: "/admin/products",
    badge: "Catalogo",
    tone: "bg-emerald-50 border-emerald-100 text-emerald-800",
  },
  {
    title: "Pedidos totales por producto",
    description: "Consulta kilos pedidos por corte en el rango deseado.",
    action: "/admin/reports",
    badge: "Reporte",
    tone: "bg-amber-50 border-amber-100 text-amber-800",
  },
  {
    title: "Permisos",
    description: "Define dias habilitados y limites semanales por usuario.",
    action: "/admin/permissions",
    badge: "Accesos",
    tone: "bg-slate-50 border-slate-200 text-slate-700",
  },
];

export const AdminHomePage = () => {
  const navigate = useNavigate();

  return (
    <AppShell>
      <SessionHeader />
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100/60">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
              Admin
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Inicio del panel</h1>
            <p className="mt-1 text-sm text-slate-600">
              Elige a donde ir. Desde aqui accedes a pedidos, catalogo, reportes y permisos.
            </p>
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {adminSections.map((section) => (
            <article
              key={section.action}
              className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-4 shadow-sm"
            >
              <div className="space-y-2">
                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${section.tone}`}
                >
                  {section.badge}
                </span>
                <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
                <p className="text-sm text-slate-700">{section.description}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => navigate(section.action)}
                  className="w-full rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
                >
                  Ir a {section.title.toLowerCase()}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
};

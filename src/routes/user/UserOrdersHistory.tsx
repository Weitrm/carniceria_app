import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { SessionHeader } from "../../components/shared/SessionHeader";
import ordersStore from "../../store/ordersStore";
import productsStore from "../../store/productsStore";
import authStore from "../../store/authStore";
import type { CartLine, OrderStatus } from "../../lib/types";

const currency = (value: number) =>
  new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);

const statusBadgeStyles: Record<OrderStatus, string> = {
  pendiente: "bg-amber-50 text-amber-700 border border-amber-200",
  hecho: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelado: "bg-rose-50 text-rose-700 border border-rose-200",
};

export const UserOrdersHistory = () => {
  const user = authStore((s) => s.user);
  const orders = ordersStore((s) => s.orders);
  const products = productsStore((s) => s.products);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "todos">("todos");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const myOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter((o) => o.userId === user.id);
  }, [orders, user]);

  const detailedOrders = useMemo(() => {
    return myOrders.map((order) => {
      const items: CartLine[] = order.items.flatMap((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return [];
        return [
          {
            ...item,
            product,
            subtotal: product.precioPorKg * item.cantidadKg,
          },
        ];
      });
      const total = items.reduce((sum, item) => sum + item.subtotal, 0);
      return { ...order, items, total };
    });
  }, [myOrders, products]);

  const filtered = useMemo(
    () =>
      detailedOrders
        .filter((o) => (statusFilter === "todos" ? true : o.status === statusFilter))
        .filter((o) => {
          if (!fromDate && !toDate) return true;
          const created = new Date(o.createdAt);
          const fromOk = fromDate ? created >= new Date(`${fromDate}T00:00:00`) : true;
          const toOk = toDate ? created <= new Date(`${toDate}T23:59:59.999Z`) : true;
          return fromOk && toOk;
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [detailedOrders, statusFilter, fromDate, toDate]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const totals = useMemo(() => {
    const count = filtered.length;
    const pending = filtered.filter((o) => o.status === "pendiente").length;
    const done = filtered.filter((o) => o.status === "hecho").length;
    return { count, pending, done };
  }, [filtered]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, fromDate, toDate]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <AppShell>
      <SessionHeader />
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100/60">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
              Historial
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Tus pedidos</h1>
            <p className="mt-1 text-sm text-slate-600">
              Filtra por estado o fecha para revisar tus pedidos anteriores.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-slate-700">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Total: {totals.count} | Pendientes: {totals.pending} | Completados: {totals.done}
            </span>
            <button
              onClick={() => {
                setStatusFilter("todos");
                setFromDate("");
                setToDate("");
              }}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700"
            >
              Limpiar filtros
            </button>
          </div>
        </header>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Estado
            </p>
            <div className="flex flex-wrap gap-2">
              {(["todos", "pendiente", "hecho", "cancelado"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    statusFilter === status
                      ? "bg-rose-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:text-rose-700"
                  }`}
                >
                  {status === "todos" ? "Todos" : status}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Desde
            </p>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Hasta
            </p>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-700 shadow-sm">
          {filtered.length === 0 ? (
            <p className="text-slate-500">No hay pedidos que coincidan con los filtros.</p>
          ) : (
            <div className="space-y-3">
              {paginated.map((order) => (
                <article
                  key={order.id}
                  className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">Pedido {order.id}</p>
                      <p className="text-xs text-slate-500">
                        Creado: {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {order.items.map((item) => (
                        <li key={item.productId}>
                          {item.product.nombre} - {item.cantidadKg} kg ({currency(item.product.precioPorKg)}/kg)
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadgeStyles[order.status]}`}
                      >
                        Estado: {order.status}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        Total: {currency(order.total)}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 sm:text-right">
                    Última actualización: {new Date(order.createdAt).toLocaleString()}
                  </div>
                </article>
              ))}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <span>
                  Página {page} de {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-slate-200 px-3 py-1 font-semibold transition hover:border-rose-200 hover:text-rose-700 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-400"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg border border-slate-200 px-3 py-1 font-semibold transition hover:border-rose-200 hover:text-rose-700 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-400"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
};

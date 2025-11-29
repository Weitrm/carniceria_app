import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { SessionHeader } from "../../components/shared/SessionHeader";
import ordersStore from "../../store/ordersStore";
import productsStore from "../../store/productsStore";
import type { CartLine, OrderStatus } from "../../lib/types";
import { loadUsers } from "../../lib/userStorage";

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

const statusButtonClasses = (target: OrderStatus, current: OrderStatus) => {
  const base = "rounded-lg px-3 py-1 text-xs font-semibold transition";
  if (target === current) {
    if (target === "hecho") return `${base} bg-emerald-600 text-white shadow-sm hover:bg-emerald-700`;
    if (target === "cancelado") return `${base} bg-rose-600 text-white shadow-sm hover:bg-rose-700`;
    return `${base} bg-amber-500 text-white shadow-sm hover:bg-amber-600`;
  }
  return `${base} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900`;
};

export const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const orders = ordersStore((s) => s.orders);
  const updateStatus = ordersStore((s) => s.updateStatus);
  const products = productsStore((s) => s.products);
  const users = useMemo(() => loadUsers(), []);

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "todos">("todos");
  const [userFilter, setUserFilter] = useState<string>("todos");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const detailedOrders = useMemo(() => {
    return orders.map((order) => {
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
      const user = users.find((u) => u.id === order.userId);
      return { ...order, items, total, userName: user?.name ?? "Usuario" };
    });
  }, [orders, products, users]);

  const filteredOrders = useMemo(
    () =>
      detailedOrders
        .filter((o) => (statusFilter === "todos" ? true : o.status === statusFilter))
        .filter((o) => (userFilter === "todos" ? true : o.userId === userFilter))
        .filter((o) => {
          if (!fromDate && !toDate) return true;
          const created = new Date(o.createdAt);
          const fromOk = fromDate ? created >= new Date(`${fromDate}T00:00:00`) : true;
          const toOk = toDate ? created <= new Date(`${toDate}T23:59:59.999Z`) : true;
          return fromOk && toOk;
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [detailedOrders, statusFilter, userFilter, fromDate, toDate]
  );

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / perPage));
  const paginatedOrders = filteredOrders.slice((page - 1) * perPage, page * perPage);
  const uniqueUsers = useMemo(
    () => users.map((u) => ({ id: u.id, label: `${u.name} (${u.funcionario})` })),
    [users]
  );
  const totals = useMemo(() => {
    const total = filteredOrders.length;
    const pending = filteredOrders.filter((o) => o.status === "pendiente").length;
    const done = filteredOrders.filter((o) => o.status === "hecho").length;
    const canceled = filteredOrders.filter((o) => o.status === "cancelado").length;
    return { total, pending, done, canceled };
  }, [filteredOrders]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, userFilter, fromDate, toDate]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const fromRow = filteredOrders.length === 0 ? 0 : (page - 1) * perPage + 1;
  const toRow = Math.min(page * perPage, filteredOrders.length);

  return (
    <AppShell>
      <SessionHeader />
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100/60">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
              Admin
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
            <p className="mt-1 text-sm text-slate-600">
              Revisa los pedidos enviados por los operarios, filtra el historial y actualiza su estado.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <button
              onClick={() => navigate("/admin/products")}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-600 sm:w-auto"
            >
              Ir a productos
            </button>
          </div>
        </header>

        <div className="mt-6 grid gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-800 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <p className="text-sm font-semibold text-slate-800">Filtros y resumen</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-200 px-3 py-1 font-semibold text-slate-700">
                  Resultados: {filteredOrders.length} / {detailedOrders.length}
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
                  Pendientes: {totals.pending}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                  Hechos: {totals.done}
                </span>
                <span className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-700">
                  Cancelados: {totals.canceled}
                </span>
              </div>
            </div>

            <div className="grid gap-3 pt-3 sm:grid-cols-2 lg:grid-cols-4">
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
                  Funcionario
                </p>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                >
                  <option value="todos">Todos</option>
                  {uniqueUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
                </select>
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

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <button
                onClick={() => {
                  setStatusFilter("todos");
                  setUserFilter("todos");
                  setFromDate("");
                  setToDate("");
                }}
                className="rounded-lg border border-slate-200 px-3 py-1 font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700"
              >
                Limpiar filtros
              </button>
              <span>
                Mostrando {fromRow === 0 ? 0 : fromRow}-{toRow} de {filteredOrders.length}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-700 shadow-sm">
            {filteredOrders.length === 0 ? (
              <p className="text-slate-500">No hay pedidos cargados.</p>
            ) : (
              <div className="space-y-3">
                {paginatedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">Pedido {order.id}</p>
                        <p className="text-xs font-semibold text-slate-700">Operario: {order.userName}</p>
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

                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Cambiar estado
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => updateStatus(order.id, "pendiente")}
                          className={statusButtonClasses("pendiente", order.status)}
                        >
                          Pendiente
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, "hecho")}
                          className={statusButtonClasses("hecho", order.status)}
                        >
                          Hecho
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, "cancelado")}
                          className={statusButtonClasses("cancelado", order.status)}
                        >
                          Cancelado
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <span>
                    Página {page} de {totalPages} · Mostrando {fromRow === 0 ? 0 : fromRow}-{toRow} de{" "}
                    {filteredOrders.length}
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
          <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-4 text-sm text-rose-800 shadow-inner">
            Historial filtrado por estado, funcionario y fechas. Ordenado del más reciente al más antiguo. Límite de 5 pedidos por página.
          </div>
        </div>
      </section>
    </AppShell>
  );
};

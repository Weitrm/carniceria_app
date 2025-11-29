import { useMemo } from "react";
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

  return (
    <AppShell>
      <SessionHeader />
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100/60">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
              Admin
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Pedidos pendientes</h1>
            <p className="mt-1 text-sm text-slate-600">
              Revisa los pedidos enviados por los operarios y actualiza su estado.
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
          <div className="rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-700 shadow-sm">
            {detailedOrders.length === 0 ? (
              <p className="text-slate-500">No hay pedidos cargados.</p>
            ) : (
              <div className="space-y-3">
                {detailedOrders.map((order) => (
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
              </div>
            )}
          </div>
          <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-4 text-sm text-rose-800 shadow-inner">
            Agrega filtros por estado (pendiente, hecho, cancelado) y acciones rapidas para cada pedido.
          </div>
        </div>
      </section>
    </AppShell>
  );
};

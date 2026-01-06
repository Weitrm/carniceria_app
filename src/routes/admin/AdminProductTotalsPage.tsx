import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { SessionHeader } from "../../components/shared/SessionHeader";
import ordersStore from "../../store/ordersStore";
import productsStore from "../../store/productsStore";

type AggregateRow = {
  productId: string;
  nombre: string;
  totalKg: number;
  orderCount: number;
  totalMonto: number;
  isActive: boolean;
};

const currency = (value: number) =>
  new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);

export const AdminProductTotalsPage = () => {
  const navigate = useNavigate();
  const orders = ordersStore((s) => s.orders);
  const products = productsStore((s) => s.products);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredOrders = useMemo(
    () =>
      orders
        .filter((o) => o.status === "pendiente")
        .filter((o) => {
          if (!fromDate && !toDate) return true;
          const created = new Date(o.createdAt);
          const fromOk = fromDate ? created >= new Date(`${fromDate}T00:00:00`) : true;
          const toOk = toDate ? created <= new Date(`${toDate}T23:59:59.999Z`) : true;
          return fromOk && toOk;
        }),
    [orders, fromDate, toDate]
  );


  const aggregates = useMemo(() => {
    const map = new Map<string, AggregateRow & { orderIds: Set<string> }>();
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        const key = item.productId;
        const current = map.get(key) ?? {
          productId: key,
          nombre: product?.nombre ?? "Producto eliminado",
          totalKg: 0,
          orderCount: 0,
          totalMonto: 0,
          isActive: product?.isActive ?? false,
          orderIds: new Set<string>(),
        };
        const nextKg = current.totalKg + item.cantidadKg;
        const price = product?.precioPorKg ?? 0;
        const nextMonto = current.totalMonto + item.cantidadKg * price;
        current.orderIds.add(order.id);
        map.set(key, {
          ...current,
          totalKg: nextKg,
          totalMonto: nextMonto,
          orderCount: current.orderIds.size,
        });
      });
    });
    return Array.from(map.values()).sort((a, b) => b.totalKg - a.totalKg);
  }, [filteredOrders, products]);

  const summary = useMemo(() => {
    const totalKg = aggregates.reduce((sum, row) => sum + row.totalKg, 0);
    const totalOrders = filteredOrders.length;
    const productsCount = aggregates.length;
    return { totalKg, totalOrders, productsCount };
  }, [aggregates, filteredOrders]);

  return (
    <AppShell>
      <SessionHeader />
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100/60">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
              Admin
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Kg pedidos por producto</h1>
            <p className="mt-1 text-sm text-slate-600">
              Revisa los kilos totales de pedidos pendientes por corte en el rango de fechas seleccionado.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="w-full rounded-lg border border-rose-100 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 sm:w-auto"
          >
            Volver al inicio
          </button>
        </header>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Filtro por fecha
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-700">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Desde
                </span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-700">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Hasta
                </span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="rounded-lg border border-slate-200 px-3 py-1 font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700"
              >
                Limpiar filtro
              </button>
              <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-700">
                Pedidos filtrados: {filteredOrders.length} / {orders.length}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Total kg
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-800">{summary.totalKg.toFixed(2)} kg</p>
            <p className="text-xs text-emerald-700">
              Kilos sumados en el rango filtrado.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Cobertura
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {summary.productsCount} productos | {summary.totalOrders} pedidos
            </p>
            <p className="text-xs text-slate-600">
              Productos con al menos un pedido en el rango elegido.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Totales por producto
              </p>
              <p className="text-sm text-slate-600">
                Ordenado por kilos descendente. Solo se consideran pedidos pendientes.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/products")}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700"
            >
              Ver productos
            </button>
          </div>

          {aggregates.length === 0 ? (
            <div className="p-6 text-sm text-slate-600">
              No hay datos para el rango seleccionado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[760px] divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Kg totales</th>
                    <th className="px-4 py-3">Pedidos</th>
                    <th className="px-4 py-3">Monto estimado</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {aggregates.map((row) => (
                    <tr key={row.productId} className="hover:bg-rose-50/40">
                      <td className="px-4 py-3 font-semibold text-slate-900">{row.nombre}</td>
                      <td className="px-4 py-3 text-slate-700">{row.totalKg.toFixed(2)} kg</td>
                      <td className="px-4 py-3 text-slate-700">{row.orderCount}</td>
                      <td className="px-4 py-3 text-slate-700">{currency(row.totalMonto)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            row.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {row.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
};

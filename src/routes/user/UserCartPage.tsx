import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { SessionHeader } from "../../components/shared/SessionHeader";
import productsStore from "../../store/productsStore";
import cartStore from "../../store/cartStore";
import ordersStore from "../../store/ordersStore";
import authStore from "../../store/authStore";
import type { CartLine, OrderStatus } from "../../lib/types";

const currencyFormat = (value: number) =>
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

export const UserCartPage = () => {
  const navigate = useNavigate();
  const user = authStore((s) => s.user);
  const products = productsStore((s) => s.products);
  const items = cartStore((s) => s.items);
  const updateCantidad = cartStore((s) => s.updateCantidad);
  const removeItem = cartStore((s) => s.removeItem);
  const clearCart = cartStore((s) => s.clear);
  const addOrder = ordersStore((s) => s.addOrder);
  const orders = ordersStore((s) => s.orders);
  const [feedback, setFeedback] = useState<string | null>(null);

  const detailedItems = useMemo<CartLine[]>(() => {
    return items.flatMap((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return [];
      return [{ ...item, product, subtotal: item.cantidadKg * product.precioPorKg }];
    });
  }, [items, products]);

  const total = detailedItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleUpdateQty = (productId: string, value: number, maxKg: number) => {
    updateCantidad(productId, value, maxKg);
  };

  const handleSend = () => {
    if (!user) return;
    if (detailedItems.length === 0) {
      setFeedback("Agrega al menos un producto antes de enviar el pedido.");
      return;
    }
    addOrder({
      userId: user.id,
      items: detailedItems.map((d) => ({
        productId: d.productId,
        cantidadKg: d.cantidadKg,
      })),
    });
    clearCart();
    setFeedback("Pedido enviado al administrador.");
    navigate("/user/products");
  };

  const lastUserOrder = useMemo(() => {
    if (!user) return null;
    const userOrders = orders.filter((o) => o.userId === user.id);
    if (userOrders.length === 0) return null;
    return userOrders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  }, [orders, user]);

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

        {feedback && (
          <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {feedback}
          </div>
        )}

        {lastUserOrder && (
          <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Estado de tu ultimo pedido
                </p>
                <p className="text-xs text-slate-500">
                  Enviado: {new Date(lastUserOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadgeStyles[lastUserOrder.status]}`}
              >
                {lastUserOrder.status}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-700 shadow-sm lg:col-span-2">
            {detailedItems.length === 0 ? (
              <div>
                Aun no hay productos en el carrito. Regresa al catalogo y agrega los cortes para este pedido.
              </div>
            ) : (
              <div className="space-y-3">
                {detailedItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.product.nombre}</p>
                      <p className="text-xs text-slate-500">
                        Max {item.product.maxKgPorPersona} kg por persona
                      </p>
                      <p className="text-xs text-slate-500">
                        Precio: {currencyFormat(item.product.precioPorKg)} /kg
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                      <label className="text-xs font-semibold text-slate-700">
                        Kg:
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          max={item.product.maxKgPorPersona}
                          value={item.cantidadKg}
                          onChange={(e) =>
                            handleUpdateQty(
                              item.productId,
                              Number(e.target.value),
                              item.product.maxKgPorPersona
                            )
                          }
                          className="ml-2 w-24 rounded-lg border border-rose-100 bg-white px-2 py-1 text-sm shadow-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                        />
                      </label>
                      <span className="text-sm font-semibold text-slate-900">
                        {currencyFormat(item.subtotal)}
                      </span>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-800 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Resumen
            </p>
            <div className="mt-2 flex items-center justify-between text-slate-800">
              <span>Total a pagar</span>
              <span className="text-lg font-bold text-slate-900">{currencyFormat(total)}</span>
            </div>
            <p className="mt-1 text-xs text-emerald-700">
              Los valores son informativos para control interno.
            </p>
            <button
              disabled={detailedItems.length === 0}
              onClick={handleSend}
              className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200"
            >
              Enviar pedido al admin
            </button>
            <button
              disabled={detailedItems.length === 0}
              onClick={clearCart}
              className="mt-2 w-full rounded-lg border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            >
              Vaciar carrito
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
};

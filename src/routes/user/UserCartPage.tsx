import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { SessionHeader } from "../../components/shared/SessionHeader";
import productsStore from "../../store/productsStore";
import cartStore from "../../store/cartStore";
import ordersStore from "../../store/ordersStore";
import authStore from "../../store/authStore";
import orderPoliciesStore from "../../store/orderPoliciesStore";
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
  const getOrderBlock = ordersStore((s) => s.getOrderBlock);
  const policies = orderPoliciesStore((s) => s.policies);
  const [feedback, setFeedback] = useState<string | null>(null);

  const detailedItems = useMemo<CartLine[]>(() => {
    return items.flatMap((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return [];
      return [{ ...item, product, subtotal: item.cantidadKg * product.precioPorKg }];
    });
  }, [items, products]);

  const totals = useMemo(() => {
    const totalKg = detailedItems.reduce((sum, item) => sum + item.cantidadKg, 0);
    const total = detailedItems.reduce((sum, item) => sum + item.subtotal, 0);
    return { totalKg, total, productCount: detailedItems.length };
  }, [detailedItems]);

  const pendingBlock = useMemo(() => {
    if (!user) return null;
    return getOrderBlock(user.id);
  }, [getOrderBlock, orders, user, policies]);
  const blockMessage = useMemo(() => {
    if (!pendingBlock) return null;
    if (pendingBlock.type === "day") {
      const nextText = pendingBlock.nextAllowedAt
        ? ` Proximo dia habilitado: ${new Date(pendingBlock.nextAllowedAt).toLocaleDateString("es-UY")}.`
        : "";
      return `${pendingBlock.reason}${nextText}`;
    }
    if (pendingBlock.type === "limit") {
      const nextText = pendingBlock.nextAllowedAt
        ? ` Podras crear otro pedido el ${new Date(pendingBlock.nextAllowedAt).toLocaleDateString("es-UY")}.`
        : "";
      const statusText = pendingBlock.order ? ` Ultimo estado: ${pendingBlock.order.status}.` : "";
      return `${pendingBlock.reason}${nextText}${statusText}`;
    }
    return pendingBlock.reason;
  }, [pendingBlock]);

  const handleUpdateQty = (productId: string, value: number, maxKg: number) => {
    updateCantidad(productId, value, maxKg);
  };

  const handleAdjustQty = (
    productId: string,
    currentValue: number,
    delta: number,
    maxKg: number
  ) => {
    const nextValue = Math.round(Math.max(0, Math.min(currentValue + delta, maxKg)) * 2) / 2;
    handleUpdateQty(productId, nextValue, maxKg);
  };

  const handleInputQty = (productId: string, rawValue: number, maxKg: number) => {
    const clamped = Math.round(Math.max(0, Math.min(rawValue, maxKg)) * 2) / 2;
    handleUpdateQty(productId, clamped, maxKg);
  };

  const handleSend = () => {
    if (!user) return;
    if (detailedItems.length === 0) {
      setFeedback("Agrega al menos un producto antes de enviar el pedido.");
      return;
    }
    if (totals.productCount > 2) {
      setFeedback("Maximo 2 productos por pedido.");
      return;
    }
    if (totals.totalKg > 8) {
      setFeedback("Maximo 8 kg en total. Ajusta cantidades antes de enviar.");
      return;
    }
    const block = getOrderBlock(user.id);
    if (block) {
      const nextText = block.nextAllowedAt
        ? ` Disponible el ${new Date(block.nextAllowedAt).toLocaleDateString("es-UY")}.`
        : "";
      const statusText = block.order ? ` Ultimo estado: ${block.order.status}.` : "";
      setFeedback(blockMessage || `${block.reason}${nextText}${statusText}`);
      return;
    }

    const result = addOrder({
      userId: user.id,
      items: detailedItems.map((d) => ({
        productId: d.productId,
        cantidadKg: d.cantidadKg,
      })),
    });
    if (!result.success) {
      setFeedback(result.reason || "No se pudo enviar el pedido. Intenta nuevamente.");
      return;
    }
    clearCart();
    setFeedback("Pedido enviado.");
    navigate("/user/products");
  };

  const lastUserOrder = useMemo(() => {
    if (!user) return null;
    const userOrders = orders.filter((o) => o.userId === user.id);
    if (userOrders.length === 0) return null;
    return userOrders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  }, [orders, user]);

  const isCartEmpty = detailedItems.length === 0;
  const overProducts = totals.productCount > 2;
  const overKg = totals.totalKg > 8;
  const disableSend = isCartEmpty || overProducts || overKg || !!pendingBlock;

  return (
    <AppShell>
      <SessionHeader />
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100/60">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
                Carrito
              </p>
              <h1 className="text-3xl font-bold text-slate-900">Confirma tu pedido</h1>
              <p className="mt-1 text-sm text-slate-600">
                Revisa cantidades y envialo. Maximo 2 productos y 8 kg en total.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 text-right">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                  {totals.productCount} productos
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                  {totals.totalKg} kg
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate("/user/products")}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Seguir comprando
                </button>
                <button
                  onClick={() => navigate("/user/history")}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700"
                >
                  Historial
                </button>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800">
              <p className="font-semibold">Checklist</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Max 2 productos</li>
                <li>• Max 8 kg totales</li>
                <li>• Ajusta con +/- o escribe los kg</li>
              </ul>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-800">
              <p className="font-semibold">Resumen rapido</p>
              <p className="text-xs text-slate-600">
                {totals.productCount} productos seleccionados, {totals.totalKg} kg en total.
              </p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-800">
              <p className="font-semibold">Estado de envio</p>
              <p className="text-xs">
                {pendingBlock ? "Pedidos limitados por reglas activas." : "Listo para enviar si cumples los limites."}
              </p>
            </div>
          </div>
        </header>

        {feedback && (
          <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {feedback}
          </div>
        )}

        {pendingBlock && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <p className="font-semibold text-rose-700">Pedidos limitados.</p>
            <p>{blockMessage}</p>
            {pendingBlock.order && (
              <p>
                Ultimo pedido: {new Date(pendingBlock.order.createdAt).toLocaleDateString("es-UY")} (estado:{" "}
                {pendingBlock.order.status})
              </p>
            )}
          </div>
        )}

        {lastUserOrder && (
          <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ultimo pedido
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
            {isCartEmpty ? (
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
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-rose-100">
                        <button
                          type="button"
                          onClick={() =>
                            handleAdjustQty(
                              item.productId,
                              item.cantidadKg,
                              -0.5,
                              item.product.maxKgPorPersona
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-xl font-bold text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow"
                          aria-label={`Disminuir kilos de ${item.product.nombre}`}
                        >
                          -
                        </button>
                        <label className="text-xs font-semibold text-slate-700">
                          Kg
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            max={item.product.maxKgPorPersona}
                            value={item.cantidadKg}
                            onChange={(e) =>
                              handleInputQty(
                                item.productId,
                                Number(e.target.value),
                                item.product.maxKgPorPersona
                              )
                            }
                            className="ml-2 w-28 rounded-lg border-2 border-rose-200 bg-rose-50 px-3 py-2 text-lg font-semibold text-slate-900 shadow-inner outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            handleAdjustQty(
                              item.productId,
                              item.cantidadKg,
                              0.5,
                              item.product.maxKgPorPersona
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-xl font-bold text-emerald-600 transition hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow"
                          aria-label={`Aumentar kilos de ${item.product.nombre}`}
                        >
                          +
                        </button>
                      </div>
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
            <div className="mt-1 text-xs text-emerald-700">
              Productos: {totals.productCount} / 2 | Kg totales: {totals.totalKg} / 8
            </div>
            {(overProducts || overKg) && (
              <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                {overProducts && <div>Maximo 2 productos por pedido.</div>}
                {overKg && <div>Maximo 8 kg totales. Reduce cantidades.</div>}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between text-slate-800">
              <span>Total estimado</span>
              <span className="text-lg font-bold text-slate-900">{currencyFormat(totals.total)}</span>
            </div>
            <p className="mt-1 text-xs text-emerald-700">
              Los valores son informativos para control interno.
            </p>
            <div className="mt-3 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isCartEmpty ? "bg-rose-400" : "bg-emerald-500"}`} />
                <span>{isCartEmpty ? "Agrega al menos un producto." : "Tienes productos listos."}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${overProducts ? "bg-rose-400" : "bg-emerald-500"}`} />
                <span>{overProducts ? "Maximo 2 productos." : "Cantidad de productos ok."}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${overKg ? "bg-rose-400" : "bg-emerald-500"}`} />
                <span>{overKg ? "Reduce kilos hasta 8." : "Kilos dentro del limite."}</span>
              </div>
            </div>
            <button
              disabled={disableSend}
              onClick={handleSend}
              className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200"
              title={
                pendingBlock
                  ? blockMessage || "No puedes enviar pedidos en este momento."
                  : undefined
              }
            >
              {pendingBlock ? "Pedido limitado" : "Enviar pedido"}
            </button>
            <button
              disabled={isCartEmpty}
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

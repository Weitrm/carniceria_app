import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { SessionHeader } from "../../components/shared/SessionHeader";
import productsStore from "../../store/productsStore";
import cartStore from "../../store/cartStore";
import ordersStore from "../../store/ordersStore";
import authStore from "../../store/authStore";
import orderPoliciesStore from "../../store/orderPoliciesStore";

const currencyFormat = (value: number) =>
  new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);

type Feedback =
  | { type: "success"; message: string }
  | { type: "error"; message: string };

type AddInfo = {
  allowedKg: number;
  reason: string | null;
};

export const UserProductsPage = () => {
  const navigate = useNavigate();
  const user = authStore((s) => s.user);
  const products = productsStore((s) => s.products);
  const items = cartStore((s) => s.items);
  const addToCart = cartStore((s) => s.addItem);
  const getOrderBlock = ordersStore((s) => s.getOrderBlock);
  const orders = ordersStore((s) => s.orders);
  const policies = orderPoliciesStore((s) => s.policies);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const activeProducts = products.filter((p) => p.isActive);
  const orderBlock = useMemo(() => {
    if (!user) return null;
    return getOrderBlock(user.id);
  }, [getOrderBlock, user, orders, policies]);
  const blockMessage = useMemo(() => {
    if (!orderBlock) return null;
    if (orderBlock.type === "day") {
      const nextText = orderBlock.nextAllowedAt
        ? ` Proximo dia habilitado: ${new Date(orderBlock.nextAllowedAt).toLocaleDateString("es-UY")}.`
        : "";
      return `${orderBlock.reason}${nextText}`;
    }
    if (orderBlock.type === "limit") {
      const nextText = orderBlock.nextAllowedAt
        ? ` Podras crear otro pedido el ${new Date(orderBlock.nextAllowedAt).toLocaleDateString("es-UY")}.`
        : "";
      const statusText = orderBlock.order ? ` Ultimo estado: ${orderBlock.order.status}.` : "";
      return `${orderBlock.reason}${nextText}${statusText}`;
    }
    return orderBlock.reason;
  }, [orderBlock]);

  const totals = useMemo(() => {
    const totalKg = items.reduce((sum, it) => sum + it.cantidadKg, 0);
    return { totalKg, productCount: items.length };
  }, [items]);

  const canAddInfo = (productId: string, maxKg: number): AddInfo => {
    if (orderBlock) {
      return {
        allowedKg: 0,
        reason: blockMessage || "No puedes agregar productos en este momento.",
      };
    }
    const existing = items.find((it) => it.productId === productId);
    if (!existing && items.length >= 2) {
      return { allowedKg: 0, reason: "Maximo 2 productos por pedido." };
    }
    const currentQty = existing?.cantidadKg ?? 0;
    const totalWithoutProduct = totals.totalKg - currentQty;
    const remainingKg = Math.max(0, 8 - totalWithoutProduct);
    const allowedForProduct = Math.min(maxKg - currentQty, remainingKg);
    if (allowedForProduct <= 0) {
      return { allowedKg: 0, reason: "Maximo 8 kg en total. Ajusta cantidades." };
    }
    return { allowedKg: allowedForProduct, reason: null };
  };

  const handleAdd = (productId: string, maxKg: number) => {
    if (orderBlock) {
      setFeedback({
        type: "error",
        message: blockMessage || "No puedes agregar productos en este momento.",
      });
      return;
    }
    const info = canAddInfo(productId, maxKg);
    if (info.allowedKg <= 0) {
      setFeedback({
        type: "error",
        message: info.reason || "No puedes agregar mas de este producto.",
      });
      return;
    }
    addToCart({ productId, cantidadKg: 1 }, maxKg);
    setFeedback({ type: "success", message: "Producto agregado al carrito." });
  };

  return (
    <AppShell>
      <SessionHeader />
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100/60">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
                Catalogo
              </p>
              <h1 className="text-3xl font-bold text-slate-900">Arma tu pedido</h1>
              <p className="mt-1 text-sm text-slate-600">
                Elige hasta 2 productos y un maximo de 8 kg en total. Ajusta cantidades mas tarde en el carrito.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 text-right">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Operario
              </span>
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
                  onClick={() => navigate("/user/cart")}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Ver carrito
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
            <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800">
              <span className="text-lg">📦</span>
              <div>
                <p className="font-semibold text-emerald-800">Reglas rapidas</p>
                <p className="text-xs">Max 2 productos y 8 kg por pedido.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50/70 px-4 py-3 text-sm text-rose-800">
              <span className="text-lg">⏳</span>
              <div>
                <p className="font-semibold text-rose-800">Estado</p>
                <p className="text-xs">
                  {orderBlock ? "Pedidos limitados por reglas de la empresa." : "Puedes agregar productos ahora."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-800">
              <span className="text-lg">🛒</span>
              <div>
                <p className="font-semibold text-slate-800">En este pedido</p>
                <p className="text-xs">
                  {totals.productCount} productos • {totals.totalKg} kg
                </p>
              </div>
            </div>
          </div>
        </header>

        {feedback && (
          <div
            className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <span>{feedback.message}</span>
          </div>
        )}
        {orderBlock && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold text-rose-700">Pedidos limitados.</p>
                <p>{blockMessage}</p>
                {orderBlock.order && (
                  <p className="text-xs text-rose-700">
                    Ultimo pedido: {new Date(orderBlock.order.createdAt).toLocaleDateString("es-UY")} (
                    {orderBlock.order.status})
                  </p>
                )}
              </div>
            </div>
            {orderBlock.order && (
              <div className="mt-3 rounded-lg border border-rose-100 bg-white px-3 py-2 text-xs text-slate-700">
                Ajusta dias o limites con tu administrador si necesitas enviar otro pedido.
              </div>
            )}
          </div>
        )}

        {activeProducts.length === 0 ? (
          <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 text-sm text-slate-700 shadow-sm">
            No hay productos activos. Cuando el administrador active cortes, apareceran aqui.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeProducts.map((product) => {
              const info = canAddInfo(product.id, product.maxKgPorPersona);
              return (
                <article
                  key={product.id}
                  className="flex h-full flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{product.nombre}</h2>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase text-emerald-700">
                      Activo
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">Max {product.maxKgPorPersona} kg por persona</p>
                  <p className="mt-2 text-2xl font-bold text-rose-700">
                    {currencyFormat(product.precioPorKg)} <span className="text-sm text-slate-500">/kg</span>
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                      Puedes agregar: {info.allowedKg} kg
                    </span>
                    {items.find((it) => it.productId === product.id) && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                        En carrito
                      </span>
                    )}
                  </div>
                  {info.reason && (
                    <p className="mt-2 text-xs font-semibold text-rose-600 leading-relaxed">{info.reason}</p>
                  )}
                  <div className="mt-4 flex flex-1 items-end">
                    <button
                      onClick={() => handleAdd(product.id, product.maxKgPorPersona)}
                      disabled={info.allowedKg <= 0}
                      className="w-full rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-200"
                    >
                      {info.allowedKg <= 0 ? "Limite alcanzado" : "Agregar al carrito"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
};

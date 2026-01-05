import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { SessionHeader } from "../../components/shared/SessionHeader";
import productsStore from "../../store/productsStore";
import cartStore from "../../store/cartStore";
import ordersStore from "../../store/ordersStore";
import authStore from "../../store/authStore";

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
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const activeProducts = products.filter((p) => p.isActive);
  const orderBlock = useMemo(() => {
    if (!user) return null;
    return getOrderBlock(user.id);
  }, [getOrderBlock, user, orders]);

  const totals = useMemo(() => {
    const totalKg = items.reduce((sum, it) => sum + it.cantidadKg, 0);
    return { totalKg, productCount: items.length };
  }, [items]);

  const canAddInfo = (productId: string, maxKg: number): AddInfo => {
    if (orderBlock) {
      const nextText = new Date(orderBlock.nextAllowedAt).toLocaleDateString("es-UY");
      const statusText = orderBlock.order.status === "hecho" ? "completado" : "pendiente";
      return {
        allowedKg: 0,
        reason: `No puedes agregar productos. Tu ultimo pedido (${statusText}) permite otro recien el ${nextText}.`,
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
      const nextText = new Date(orderBlock.nextAllowedAt).toLocaleDateString("es-UY");
      setFeedback({
        type: "error",
        message: `Ya tienes un pedido en proceso. Podras hacer otro el ${nextText} o si se cancela.`,
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
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
              Catalogo
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Productos disponibles</h1>
            <p className="mt-1 text-sm text-slate-600">
              Maximo 8 kg por pedido y hasta 2 productos distintos.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Operario
            </span>
            <span className="text-xs text-slate-500">
              En carrito: {totals.productCount} productos, {totals.totalKg} kg
            </span>
            <button
              onClick={() => navigate("/user/cart")}
              className="w-full rounded-lg border border-emerald-200 bg-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 sm:w-auto"
            >
              Ir al carrito
            </button>
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
            <p className="font-semibold text-rose-700">Pedido bloqueado temporalmente.</p>
            <p>
              Ultimo pedido: {new Date(orderBlock.order.createdAt).toLocaleDateString("es-UY")} (
              {orderBlock.order.status})
            </p>
            <p>
              Podras crear un nuevo pedido el {new Date(orderBlock.nextAllowedAt).toLocaleDateString("es-UY")} o
              si el actual se cancela.
            </p>
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
                  <p className="mt-1 text-sm text-slate-600">
                    Max {product.maxKgPorPersona} kg por persona
                  </p>
                  <p className="mt-2 text-2xl font-bold text-rose-700">
                    {currencyFormat(product.precioPorKg)}{" "}
                    <span className="text-sm text-slate-500">/kg</span>
                  </p>
                  {info.reason && (
                    <p className="mt-2 text-xs font-semibold text-rose-600">{info.reason}</p>
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

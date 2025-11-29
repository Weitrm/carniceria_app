import { Link, useNavigate } from "react-router-dom";
import authStore from "../../store/authStore";

export const SessionHeader = () => {
  const navigate = useNavigate();
  const user = authStore((s) => s.user);
  const logout = authStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  const isAdmin = user.role === "admin";

  return (
    <header className="flex items-center justify-between rounded-2xl border border-rose-100 bg-white px-4 py-3 shadow-sm">
      <Link
        to={isAdmin ? "/admin/orders" : "/user/products"}
        className="flex items-center gap-2 font-semibold text-rose-700"
      >
        <div className="flex items-center gap-1">
          <img src="../logo.svg" alt="logo" className="w-10 h-10" />
          <h1 className="font-bold">Carniceria FMP</h1>
        </div>
      </Link>
      <div className="flex items-center gap-3 text-sm text-slate-700">
        {!isAdmin && (
          <>
            <Link
              to="/user/history"
              className="rounded-lg border border-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              Historial
            </Link>
            <Link
              to="/user/cart"
              className="rounded-lg border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Carrito
            </Link>
          </>
        )}
        <span className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-700">
          {user.nombre} - {user.role}
        </span>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700"
        >
          Salir
        </button>
      </div>
    </header>
  );
};

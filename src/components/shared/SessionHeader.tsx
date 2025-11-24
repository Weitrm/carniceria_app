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

  return (
    <header className="flex items-center justify-between bg-white shadow px-4 py-3">
      <Link to={user.role === "admin" ? "/admin/orders" : "/user/products"} className="font-semibold text-rose-600">
        Carnicería FMP
      </Link>
      <div className="flex items-center gap-3 text-sm text-slate-700">
        <span>{user.nombre} · {user.role}</span>
        <button onClick={handleLogout} className="rounded bg-rose-600 px-3 py-1 text-white text-xs font-semibold hover:bg-rose-700">
          Salir
        </button>
      </div>
    </header>
  );
};

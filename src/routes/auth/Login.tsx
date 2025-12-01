import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import authStore from "../../store/authStore";
import { loadUsers } from "../../lib/userStorage";
import { isValidEmail } from "../../lib/validation";

type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export const Login = () => {
  const navigate = useNavigate();
  const login = authStore((state) => state.login);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: { remember: true },
  });

  const onSubmit = handleSubmit(async (values) => {
    const users = loadUsers();
    const found = users.find(
      (u) => u.email === values.email && u.password === values.password
    );

    if (!found) {
      setFormError("Credenciales incorrectas");
      return;
    }

    login({ id: found.id, nombre: found.name, role: found.role }, values.remember);
    navigate(
      found.role === "admin" ? "/admin/products" : "/user/products",
      { replace: true }
    );
  });

  return (
    <main className="min-h-screen bg-linear-to-br from-rose-50 via-white to-amber-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 sm:px-6 lg:flex-row">
        <section className="flex flex-1 items-center justify-center bg-white/70 px-6 py-12 backdrop-blur sm:px-8 lg:px-12">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-rose-100">
            <header className="mb-8 space-y-2">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="Carniceria FMP" className="h-10 w-10" />
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
                  Carniceria <span className="text-emerald-700">FMP</span>
                </p>
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
                Bienvenido de nuevo
              </p>
              <h2 className="text-3xl font-bold text-slate-900">Iniciar sesión</h2>
              <p className="text-sm text-slate-600">
                Usa tus credenciales para ingresar al panel de gestión.
              </p>
            </header>

            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="flex items-center justify-between text-sm font-medium text-slate-700"
                >
                  Correo electrónico
                  {errors.email && (
                    <span className="text-xs font-semibold text-rose-600">
                      {errors.email.message}
                    </span>
                  )}
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email", {
                    required: "Ingresa tu correo",
                    pattern: {
                      value: isValidEmail.regex,
                      message: "Correo no válido",
                    },
                  })}
                  className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                  placeholder="operario@carniceria.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="flex items-center justify-between text-sm font-medium text-slate-700"
                >
                  Contraseña
                  {errors.password && (
                    <span className="text-xs font-semibold text-rose-600">
                      {errors.password.message}
                    </span>
                  )}
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password", {
                    required: "Ingresa tu contraseña",
                    minLength: {
                      value: 6,
                      message: "Mínimo 6 caracteres",
                    },
                  })}
                  className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                  placeholder="********"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-slate-700">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-400"
                    {...register("remember")}
                  />
                  <span>Recordarme</span>
                </label>
                <button
                  type="button"
                  className="font-semibold text-rose-600 transition hover:text-rose-700"
                  onClick={() => setFormError("Solicita el reseteo al administrador.")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {formError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Ingresando..." : "Entrar al panel"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              ¿Aún no tienes cuenta?{" "}
              <Link
                to="/register"
                className="font-semibold text-rose-600 transition hover:text-rose-700"
              >
                Crear perfil
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

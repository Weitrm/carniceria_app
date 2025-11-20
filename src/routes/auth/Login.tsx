import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: { remember: true },
    
  });

  const onSubmit = handleSubmit(async (values) => {
    /*TODO: Integrar con el backend o el store de autenticación.*/
    console.log("Iniciando sesión con:", values);
  });

  return (
    <main className="min-h-screen bg-linear-to-br from-rose-50 via-white to-amber-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
        <section className="flex flex-1 flex-col justify-center gap-6 px-8 py-12 lg:px-12">
          <p className="text-sm flex justify-center font-semibold uppercase tracking-[0.25em] text-rose-500">
            Carnicería <span className="text-green-800 ml-2">FMP</span>
          </p>
          <h1 className="text-4xl flex justify-center font-bold text-slate-900 sm:text-5xl">
            Panel de acceso
          </h1>
          <p className="max-w-xl text-lg flex justify-center text-slate-600">
            Registrate para realizar tu pedido
          </p>
          <div className="grid grid-cols-1 gap-4 text-sm text-slate-700 sm:grid-cols-2">
            <article className="flex items-start gap-3 rounded-xl bg-white/80 p-4 shadow-sm ring-1 ring-rose-100">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-600">
                1
              </span>
              <div className="space-y-1">
                <h3 className="font-semibold">Observa los productos disponibles.</h3>
                <p className="text-slate-500">Podes ver la carne que hay disponible cada semana.</p>
              </div>
            </article>
            <article className="flex items-start gap-3 rounded-xl bg-white/80 p-4 shadow-sm ring-1 ring-rose-100">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-600">
                2
              </span>
              <div className="space-y-1">
                <h3 className="font-semibold">Realiza tu pedido rapido</h3>
                <p className="text-slate-500">Agrega a tu pedido el corte y cantidad que tengas disponible.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center bg-white/70 px-8 py-12 backdrop-blur lg:px-12">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-rose-100">
            <header className="mb-8 space-y-2">
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
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
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
                  placeholder="••••••••"
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
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Ingresando..." : "Entrar al panel"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              ¿Aún no tienes cuenta? {" "}
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

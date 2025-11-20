
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

type RegisterFormValues = {
  nombre: string;
  email: string;
  legajo: string;
  password: string;
  repeatPassword: string;
};

type StoredUser = {
  id: string;
  nombre: string;
  email: string;
  legajo: string;
  password: string;
  role: "operario" | "admin";
};

const USERS_STORAGE_KEY = "carniceria_users";
const CURRENT_USER_KEY = "carniceria_currentUser";
const DEFAULT_ADMIN_USER: StoredUser = {
  id: "admin-001",
  nombre: "Administrador",
  email: "admin@carniceria.com",
  legajo: "000",
  password: "admin123",
  role: "admin",
};

const generateId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const readPersistedUsers = (): StoredUser[] => {
  const raw = localStorage.getItem(USERS_STORAGE_KEY);

  if (!raw) {
    return [DEFAULT_ADMIN_USER];
  }

  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    const alreadyHasAdmin = parsed.some(
      (user) => user.email === DEFAULT_ADMIN_USER.email
    );
    return alreadyHasAdmin ? parsed : [...parsed, DEFAULT_ADMIN_USER];
  } catch {
    return [DEFAULT_ADMIN_USER];
  }
};

const persistUsers = (users: StoredUser[]) => {
  const alreadyHasAdmin = users.some(
    (user) => user.email === DEFAULT_ADMIN_USER.email
  );
  const sanitizedUsers = alreadyHasAdmin
    ? users
    : [...users, DEFAULT_ADMIN_USER];

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(sanitizedUsers));
};

export const Register = () => {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>();

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const trimmedNombre = values.nombre.trim();
    const trimmedEmail = values.email.trim().toLowerCase();
    const trimmedLegajo = values.legajo.trim();

    if (values.password !== values.repeatPassword) {
      setFormError("Las contrasenas no coinciden.");
      return;
    }

    const persistedUsers = readPersistedUsers();
    const emailAlreadyExists = persistedUsers.some(
      (user) => user.email.toLowerCase() === trimmedEmail
    );

    if (emailAlreadyExists) {
      setFormError("Ya existe un usuario registrado con ese correo.");
      return;
    }

    const newUser: StoredUser = {
      id: generateId(),
      nombre: trimmedNombre,
      email: trimmedEmail,
      legajo: trimmedLegajo,
      password: values.password,
      role: "operario",
    };

    const updatedUsers = [...persistedUsers, newUser];

    persistUsers(updatedUsers);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    navigate("/user/products", { replace: true });
  });

  return (
    <main className="min-h-screen bg-linear-to-br from-rose-50 via-white to-amber-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
        <section className="flex flex-1 flex-col justify-center gap-6 px-8 py-12 lg:px-12">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
            Carniceria Los Andes
          </p>
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
            Crear nuevo usuario
          </h1>
          <p className="max-w-xl text-lg text-slate-600">
            Registra a tus operarios para que puedan gestionar pedidos y
            productos desde cualquier lugar.
          </p>
          <div className="grid grid-cols-1 gap-4 text-sm text-slate-700 sm:grid-cols-2">
            <article className="flex items-start gap-3 rounded-xl bg-white/80 p-4 shadow-sm ring-1 ring-rose-100">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-600">
                1
              </span>
              <div className="space-y-1">
                <h3 className="font-semibold">Todo en orden</h3>
                <p className="text-slate-500">
                  Seguimiento de pedidos y clientes en un solo panel.
                </p>
              </div>
            </article>
            <article className="flex items-start gap-3 rounded-xl bg-white/80 p-4 shadow-sm ring-1 ring-rose-100">
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-600">
                2
              </span>
              <div className="space-y-1">
                <h3 className="font-semibold">Operarios conectados</h3>
                <p className="text-slate-500">
                  Cada usuario tiene su perfil y accesos personalizados.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center bg-white/70 px-8 py-12 backdrop-blur lg:px-12">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-rose-100">
            <header className="mb-8 space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
                Registro interno
              </p>
              <h2 className="text-3xl font-bold text-slate-900">
                Crear cuenta operario
              </h2>
              <p className="text-sm text-slate-600">
                Todos los campos son obligatorios para habilitar el acceso.
              </p>
            </header>

            {formError && (
              <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {formError}
              </div>
            )}

            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="nombre"
                  className="flex items-center justify-between text-sm font-medium text-slate-700"
                >
                  Nombre completo
                  {errors.nombre && (
                    <span className="text-xs font-semibold text-rose-600">
                      {errors.nombre.message}
                    </span>
                  )}
                </label>
                <input
                  id="nombre"
                  type="text"
                  {...register("nombre", { required: "Indicá el nombre" })}
                  className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                  placeholder="Nombre y apellido"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="flex items-center justify-between text-sm font-medium text-slate-700"
                >
                  Correo electronico
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
                    required: "Ingresa un correo",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Correo invalido",
                    },
                  })}
                  className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                  placeholder="operario@carniceria.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="legajo"
                  className="flex items-center justify-between text-sm font-medium text-slate-700"
                >
                  Número de funcionario
                  {errors.legajo && (
                    <span className="text-xs font-semibold text-rose-600">
                      {errors.legajo.message}
                    </span>
                  )}
                </label>
                <input
                  id="legajo"
                  type="text"
                  inputMode="numeric"
                  {...register("legajo", {
                    required: "Ingresa el legajo",
                    minLength: { value: 3, message: "Mínimo 3 dígitos" },
                  })}
                  className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                  placeholder="12345"
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
                  autoComplete="new-password"
                  {...register("password", {
                    required: "Definí una contraseña",
                    minLength: {
                      value: 6,
                      message: "Mínimo 6 caracteres",
                    },
                  })}
                  className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                  placeholder="********"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="repeatPassword"
                  className="flex items-center justify-between text-sm font-medium text-slate-700"
                >
                  Repetir contraseña
                  {errors.repeatPassword && (
                    <span className="text-xs font-semibold text-rose-600">
                      {errors.repeatPassword.message}
                    </span>
                  )}
                </label>
                <input
                  id="repeatPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register("repeatPassword", {
                    required: "Repetí la contraseña",
                    minLength: {
                      value: 6,
                      message: "Mínimo 6 caracteres",
                    },
                  })}
                  className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                  placeholder="********"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Registrando..." : "Crear cuenta"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="font-semibold text-rose-600 transition hover:text-rose-700"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

import { useState } from "react";
import { Link } from "react-router-dom";
import { loadUsers, saveUsers } from "../../lib/userStorage";
import type {StoredUser} from "../../lib/userStorage"


export const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [funcionario, setFuncionario] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [formError, setFormError] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !funcionario || !password || !repeatPassword) {
      setFormError("Todos los campos son obligatorios");
      return;
    }

    if (!email.includes("@")) {
      setFormError("El email no parece válido");
      return;
    }

    if (password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== repeatPassword) {
      setFormError("Las contraseñas no coindicen");
      return;
    }

    const users = loadUsers();
    if (users.some((u) => u.email === email)) {
      setFormError("Ese correo ya está registrado");
      return;
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      funcionario,
      password,
      role: "operario",
    };

    saveUsers([...users, newUser]);
    setFormError("");
    console.log("Usuario listo para registrar:", newUser);
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-rose-50 via-white to-amber-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
        <section className="flex flex-1 items-center justify-center bg-white/70 px-8 py-12 backdrop-blur lg:px-12">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-rose-100">
            <header className="mb-8 space-y-2">
              <p className="text-sm flex justify-center mb-4 font-bold uppercase tracking-[0.25em] text-rose-500">
                Carniceria <span className="text-emerald-800 ">FMP</span>
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
                  htmlFor="name"
                  className="flex items-center justify-between text-sm font-medium text-slate-700"
                >
                  Nombre completo
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="flex items-center justify-between text-sm font-medium text-slate-700"
                >
                  Correo electronico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="funcionario"
                  className="flex items-center justify-between text-sm font-medium text-slate-700"
                >
                  Número de funcionario
                </label>
                <input
                  id="funcionario"
                  type="text"
                  value={funcionario}
                  onChange={(e) => setFuncionario(e.target.value)}
                  className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                  placeholder="123"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="flex items-center justify-between text-sm font-medium text-slate-700"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                </label>
                <input
                  id="repeatPassword"
                  type="password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="w-full rounded-xl border border-rose-100 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
                  placeholder="********"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Crear cuenta
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

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { SessionHeader } from "../../components/shared/SessionHeader";
import { authRepository } from "../../lib/repositories/authRepository";
import type { OrderPolicy, Weekday, StoredUser } from "../../lib/types";
import {
  WEEK_DAYS,
  describeLimit,
  findNextAllowedDate,
  formatAllowedDays,
} from "../../lib/orderPolicies";
import orderPoliciesStore from "../../store/orderPoliciesStore";

const DAY_LABEL: Record<Weekday, string> = {
  lunes: "Lun",
  martes: "Mar",
  miercoles: "Mie",
  jueves: "Jue",
  viernes: "Vie",
  sabado: "Sab",
  domingo: "Dom",
};

const quickSets: { label: string; days: Weekday[] }[] = [
  { label: "Solo jueves", days: ["jueves"] },
  { label: "Solo viernes", days: ["viernes"] },
  { label: "Jueves y viernes", days: ["jueves", "viernes"] },
  { label: "Todos los dias", days: WEEK_DAYS },
];

export const AdminOrderPermissionsPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<StoredUser[]>(() => authRepository.loadUsers());
  const policies = orderPoliciesStore((s) => s.policies);
  const setPolicy = orderPoliciesStore((s) => s.setPolicy);
  const resetPolicy = orderPoliciesStore((s) => s.resetPolicy);
  const getPolicy = orderPoliciesStore((s) => s.getPolicy);
  const removePolicy = orderPoliciesStore((s) => s.removePolicy);

  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id ?? "");
  const [selectedDays, setSelectedDays] = useState<Weekday[]>(WEEK_DAYS);
  const [limitValue, setLimitValue] = useState<number>(1);
  const [unlimited, setUnlimited] = useState(false);

  useEffect(() => {
    if (!selectedUserId) return;
    const policy = getPolicy(selectedUserId);
    setSelectedDays(policy.allowedDays);
    setUnlimited(policy.maxOrdersPerWeek === null);
    setLimitValue(policy.maxOrdersPerWeek ?? 1);
  }, [selectedUserId, getPolicy, policies]);

  const selectedPolicy: OrderPolicy | null = useMemo(() => {
    if (!selectedUserId) return null;
    return {
      userId: selectedUserId,
      allowedDays: selectedDays,
      maxOrdersPerWeek: unlimited ? null : limitValue,
    };
  }, [selectedUserId, selectedDays, unlimited, limitValue]);

  const nextAllowed = useMemo(() => {
    if (!selectedPolicy) return null;
    return findNextAllowedDate(selectedPolicy);
  }, [selectedPolicy]);

  const toggleDay = (day: Weekday) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    if (!selectedUserId || !selectedPolicy) return;
    setPolicy(selectedUserId, {
      allowedDays: selectedPolicy.allowedDays,
      maxOrdersPerWeek: selectedPolicy.maxOrdersPerWeek,
    });
  };

  const handleReset = () => {
    if (!selectedUserId) return;
    resetPolicy(selectedUserId);
  };

  const handleDeleteUser = (userId: string) => {
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    authRepository.saveUsers(updated);
    removePolicy(userId);
  };

  useEffect(() => {
    if (users.length === 0) {
      setSelectedUserId("");
      return;
    }
    const stillExists = users.some((u) => u.id === selectedUserId);
    if (!stillExists) {
      setSelectedUserId(users[0]?.id ?? "");
    }
  }, [users, selectedUserId]);

  return (
    <AppShell>
      <SessionHeader />
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100/60">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
              Admin
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Permisos de pedidos</h1>
            <p className="mt-1 text-sm text-slate-600">
              Define en que dias cada usuario puede enviar pedidos y si tienen limite semanal o no.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="w-full rounded-lg border border-rose-100 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 sm:w-auto"
          >
            Volver al inicio
          </button>
        </header>

        {users.length === 0 ? (
          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-700">
            No hay usuarios registrados.
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 shadow-inner">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Usuarios
                </p>
                <div className="mt-3 space-y-2">
                  {users.map((user) => {
                    const policy = getPolicy(user.id);
                    const isSelected = selectedUserId === user.id;
                    const cardClasses = `w-full rounded-lg border px-3 py-2 text-left transition ${
                      isSelected
                        ? "border-rose-300 bg-rose-50 text-rose-800"
                        : "border-slate-200 bg-white text-slate-800 hover:border-rose-200"
                    }`;
                    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedUserId(user.id);
                      }
                    };
                    return (
                      <div
                        key={user.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedUserId(user.id)}
                        onKeyDown={handleKeyDown}
                        className={cardClasses}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">
                              {user.name} <span className="text-xs text-slate-500">({user.funcionario})</span>
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {formatAllowedDays(policy.allowedDays)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                              {describeLimit(policy)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(user.id);
                              }}
                              className="rounded-md border border-rose-100 bg-white px-2 py-1 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-50"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-800 shadow-inner">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Referencia rapida
                </p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>- 0 en limite semanal bloquea pedidos.</li>
                  <li>- Activa "Sin limite" para no aplicar tope.</li>
                  <li>- Dias sin seleccionar bloquean todos los pedidos.</li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Configuracion
                  </p>
                  <p className="text-sm text-slate-700">
                    {selectedPolicy
                      ? `Editando permisos de ${users.find((u) => u.id === selectedUserId)?.name ?? ""}`
                      : "Selecciona un usuario para editar."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleReset}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700"
                    disabled={!selectedUserId}
                  >
                    Restaurar por defecto
                  </button>
                  <button
                    onClick={handleSave}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-200"
                    disabled={!selectedUserId}
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Dias habilitados
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {WEEK_DAYS.map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                          selectedDays.includes(day)
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:text-rose-700"
                        }`}
                      >
                        {DAY_LABEL[day]}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {quickSets.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => setSelectedDays(preset.days)}
                        className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Limite semanal de pedidos (ventana de 7 dias)
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={unlimited}
                          onChange={(e) => setUnlimited(e.target.checked)}
                          className="h-5 w-5 rounded border-slate-300 text-rose-600 focus:ring-rose-400"
                        />
                        Sin limite
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={limitValue}
                        onChange={(e) => setLimitValue(Math.max(0, Number(e.target.value)))}
                        disabled={unlimited}
                        className="w-28 rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                      <span className="text-xs text-slate-600">
                        0 = bloqueado | 1 = un pedido | 2 = dos pedidos, etc.
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    <p className="font-semibold text-slate-800">
                      {selectedPolicy ? describeLimit(selectedPolicy) : "Sin seleccion"}
                    </p>
                    <p>
                      Dias: {selectedPolicy ? formatAllowedDays(selectedPolicy.allowedDays) : "No definido"}
                    </p>
                    {nextAllowed && (
                      <p>
                        Proximo dia habilitado: {nextAllowed.toLocaleDateString("es-UY")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
};

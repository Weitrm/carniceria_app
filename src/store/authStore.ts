import { create } from "zustand";
import type { SessionUser } from "../lib/types";

type AuthState = {
  user: SessionUser | null;
  login: (data: SessionUser, remember?: boolean) => void;
  logout: () => void;
};

// Obtiene el usuario guardado del localStorage
const CURRENT_USER_KEY = "carniceria_currentUser";
const getStoredUser = (): SessionUser | null => {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SessionUser> & { name?: string };
    if (!parsed.id || !parsed.role) return null;
    return {
      id: parsed.id,
      role: parsed.role,
      nombre: parsed.nombre ?? parsed.name ?? "",
    };
  } catch {
    return null;
  }
};

export const authStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  login: ({ id, nombre, role }, remember = true) =>
    set(() => {
      const user = { id, nombre, role } satisfies SessionUser;
      if (remember) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
      return { user };
    }),
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    set({ user: null });
  },
}));

export default authStore;

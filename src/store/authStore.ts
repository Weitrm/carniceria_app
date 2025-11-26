import { create } from "zustand";
import type { SessionUser } from "../lib/types";

type AuthState = {
  user: SessionUser | null;
  login: (data: SessionUser) => void;
  logout: () => void;
};

// Obtiene el usuario guardado del localStorage
const CURRENT_USER_KEY = "carniceria_currentUser";
const getStoredUser = (): SessionUser | null => {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
};

export const authStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  login: ({ id, nombre, role }) =>
    set(() => {
      const user = { id, nombre, role } satisfies SessionUser;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return { user };
    }),
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    set({ user: null });
  },
}));

export default authStore;

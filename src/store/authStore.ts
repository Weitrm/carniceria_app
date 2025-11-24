
import { create } from "zustand";
import type { User, UserRole } from "../lib/types";

type AuthState = {
  user: User | null;
  login: (data: { id: string; nombre: string; role: UserRole }) => void;
  logout: () => void;
};

// Obtiene el usuario guardado del localStorage
const CURRENT_USER_KEY = "carniceria_currentUser";
const getStoredUser = (): User | null => {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};


export const authStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  login: ({ id, nombre, role }) =>
      set(() => {
        const user = { id, nombre, role };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return { user };
      }),

    logout: () => {
      localStorage.removeItem(CURRENT_USER_KEY);
      set({ user: null });
    },
  }));

export default authStore;
import { create } from "zustand";
import type { SessionUser } from "../lib/types";
import { authRepository } from "../lib/repositories/authRepository";

type AuthState = {
  user: SessionUser | null;
  login: (data: SessionUser, remember?: boolean) => void;
  logout: () => void;
};

export const authStore = create<AuthState>((set) => ({
  user: authRepository.getSession(),
  login: ({ id, nombre, role }, remember = true) =>
    set(() => {
      const user = { id, nombre, role } satisfies SessionUser;
      if (remember) {
        authRepository.setSession(user);
      } else {
        authRepository.clearSession();
      }
      return { user };
    }),
  logout: () => {
    authRepository.clearSession();
    set({ user: null });
  },
}));

export default authStore;

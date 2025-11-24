import type { UserRole } from "./types";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  funcionario: string;
  password: string;
  role: UserRole;
};

export const USERS_STORAGE_KEY = "carniceria_users";
export const CURRENT_USER_KEY = "carniceria_currentUser";

const DEFAULT_ADMIN_USER: StoredUser = {
  id: "admin-001",
  name: "Administrador",
  email: "admin@carniceria.com",
  funcionario: "000",
  password: "admin123",
  role: "admin",
};

export const loadUsers = (): StoredUser[] => {
  const raw = localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) return [DEFAULT_ADMIN_USER];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [DEFAULT_ADMIN_USER];
  } catch {
    return [DEFAULT_ADMIN_USER];
  }
};

export const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

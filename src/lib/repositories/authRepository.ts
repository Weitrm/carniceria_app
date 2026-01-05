import type { SessionUser, StoredUser } from "../types";
import { CURRENT_USER_KEY, loadUsers, saveUsers } from "../userStorage";

export interface AuthRepository {
  loadUsers(): StoredUser[];
  saveUsers(users: StoredUser[]): void;
  getSession(): SessionUser | null;
  setSession(user: SessionUser): void;
  clearSession(): void;
}

export class LocalAuthRepository implements AuthRepository {
  loadUsers(): StoredUser[] {
    return loadUsers();
  }

  saveUsers(users: StoredUser[]): void {
    saveUsers(users);
  }

  getSession(): SessionUser | null {
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
  }

  setSession(user: SessionUser): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  clearSession(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export const authRepository = new LocalAuthRepository();

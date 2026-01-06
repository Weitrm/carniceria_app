import { create } from "zustand";
import type { OrderPolicy, Weekday } from "../lib/types";
import {
  defaultPolicyForUser,
  sanitizeDays,
} from "../lib/orderPolicies";
import {
  loadOrderPolicies,
  saveOrderPolicies,
} from "../lib/orderPoliciesStorage";

type OrderPoliciesState = {
  policies: OrderPolicy[];
  setPolicy: (userId: string, data: Partial<Omit<OrderPolicy, "userId">>) => void;
  setAllowedDays: (userId: string, days: Weekday[]) => void;
  setLimit: (userId: string, limit: number | null) => void;
  resetPolicy: (userId: string) => void;
  getPolicy: (userId: string) => OrderPolicy;
  removePolicy: (userId: string) => void;
};

const persist = (policies: OrderPolicy[]) => {
  saveOrderPolicies(policies);
  return policies;
};

export const orderPoliciesStore = create<OrderPoliciesState>((set, get) => ({
  policies: loadOrderPolicies(),
  setPolicy: (userId, data) =>
    set((state) => {
      const existing = state.policies.find((p) => p.userId === userId);
      const base = existing ?? defaultPolicyForUser(userId);
      const next: OrderPolicy = {
        ...base,
        ...data,
        allowedDays:
          data.allowedDays !== undefined
            ? sanitizeDays(data.allowedDays)
            : base.allowedDays,
        maxOrdersPerWeek:
          data.maxOrdersPerWeek === undefined
            ? base.maxOrdersPerWeek
            : data.maxOrdersPerWeek === null
              ? null
              : Math.max(0, Math.floor(data.maxOrdersPerWeek)),
      };
      const policies = existing
        ? state.policies.map((p) => (p.userId === userId ? next : p))
        : [...state.policies, next];
      return { policies: persist(policies) };
    }),
  setAllowedDays: (userId, days) => get().setPolicy(userId, { allowedDays: days }),
  setLimit: (userId, limit) => get().setPolicy(userId, { maxOrdersPerWeek: limit }),
  resetPolicy: (userId) =>
    set((state) => {
      const filtered = state.policies.filter((p) => p.userId !== userId);
      const policies = [...filtered, defaultPolicyForUser(userId)];
      return { policies: persist(policies) };
    }),
  getPolicy: (userId) => {
    const found = get().policies.find((p) => p.userId === userId);
    return found ?? defaultPolicyForUser(userId);
  },
  removePolicy: (userId) =>
    set((state) => {
      const policies = state.policies.filter((p) => p.userId !== userId);
      return { policies: persist(policies) };
    }),
}));

export default orderPoliciesStore;

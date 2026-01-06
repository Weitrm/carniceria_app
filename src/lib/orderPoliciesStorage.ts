import type { OrderPolicy } from "./types";
import { storage } from "./storage";

const ORDER_POLICIES_KEY = "carniceria_order_policies";

export const loadOrderPolicies = (): OrderPolicy[] =>
  storage.get<OrderPolicy[]>(ORDER_POLICIES_KEY, []);

export const saveOrderPolicies = (policies: OrderPolicy[]) =>
  storage.set<OrderPolicy[]>(ORDER_POLICIES_KEY, policies);

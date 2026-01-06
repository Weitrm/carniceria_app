import type { OrderPolicy, Weekday } from "./types";

export const WEEK_DAYS: Weekday[] = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const DAY_FROM_INDEX: Weekday[] = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
];

export const dayFromDate = (date: Date): Weekday => DAY_FROM_INDEX[date.getDay()];

export const defaultPolicyForUser = (userId: string): OrderPolicy => ({
  userId,
  allowedDays: WEEK_DAYS,
  maxOrdersPerWeek: 1,
});

export const sanitizeDays = (days: Weekday[]): Weekday[] => {
  const unique = Array.from(new Set(days));
  return unique.filter((day): day is Weekday => WEEK_DAYS.includes(day));
};

export const isDayAllowed = (policy: OrderPolicy, date: Date = new Date()): boolean => {
  const today = dayFromDate(date);
  if (policy.allowedDays.length === 0) return false;
  return policy.allowedDays.includes(today);
};

export const findNextAllowedDate = (
  policy: OrderPolicy,
  from: Date = new Date()
): Date | null => {
  if (policy.allowedDays.length === 0) return null;
  for (let offset = 0; offset < 7; offset += 1) {
    const candidate = new Date(from);
    candidate.setHours(0, 0, 0, 0);
    candidate.setDate(candidate.getDate() + offset);
    if (isDayAllowed(policy, candidate)) {
      return candidate;
    }
  }
  return null;
};

export const formatAllowedDays = (days: Weekday[]): string => {
  if (days.length === WEEK_DAYS.length) return "Todos los dias";
  if (days.length === 0) return "Ningun dia";
  const ordered = WEEK_DAYS.filter((day) => days.includes(day));
  return ordered.join(", ");
};

export const describeLimit = (policy: OrderPolicy): string => {
  if (policy.maxOrdersPerWeek === null) return "Sin limite de pedidos";
  if (policy.maxOrdersPerWeek === 0) return "Pedidos bloqueados";
  if (policy.maxOrdersPerWeek === 1) return "1 pedido cada 7 dias";
  return `${policy.maxOrdersPerWeek} pedidos cada 7 dias`;
};

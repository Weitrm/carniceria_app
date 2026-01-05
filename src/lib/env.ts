import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional(),
});

const rawEnv = {
  VITE_API_BASE_URL: import.meta.env?.VITE_API_BASE_URL,
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.warn("Invalid env vars, falling back to defaults", parsed.error.issues);
}

export const env = parsed.success ? parsed.data : { VITE_API_BASE_URL: undefined };

export type Env = typeof env;

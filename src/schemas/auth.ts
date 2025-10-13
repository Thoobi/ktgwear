import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  username: z
    .string()
    .min(2, { message: "Username too short" })
    .max(32, { message: "Username too long" }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const adminSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export function zodErrorsToFieldMap(err: z.ZodError) {
  const map: Record<string, string> = {};
  for (const e of err.errors) {
    const key = e.path[0] ?? "_";
    map[String(key)] = e.message;
  }
  return map;
}

export type ValidationErrorMap = Record<string, string>;

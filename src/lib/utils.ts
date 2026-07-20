import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateOptions<T extends z.ZodTypeAny>(
  config: unknown,
  validator: T
): z.infer<T> {
  const result = validator.safeParse(config);
  if (!result.success) {
    throw new Error(result.error.message);
  }
  return result.data;
}

export function openBtop(glazewm?: { runCommand: (cmd: string) => Promise<any> } | null) {
  if (!glazewm) return;
  // Dynamically uses %LOCALAPPDATA% or PATH so it works for all users without hardcoding username paths
  glazewm.runCommand('shell-exec wt %LOCALAPPDATA%\\Microsoft\\WinGet\\Links\\btop.exe || wt btop');
}

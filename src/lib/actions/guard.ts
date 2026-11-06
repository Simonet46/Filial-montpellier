import "server-only";
import { ForbiddenError } from "../auth";
import { getI18n } from "../i18n";
import type { ActionState } from "../types";

/** Ejecuta una mutación y traduce los errores a un mensaje para el formulario. */
export async function guarded(fn: () => Promise<void>): Promise<ActionState> {
  const { t } = await getI18n();
  try {
    await fn();
    return { ok: true };
  } catch (err) {
    if (err instanceof ForbiddenError) return { error: t.common.forbidden };
    if (err instanceof RequiredError) return { error: t.common.required };
    console.error(err);
    return { error: `${t.common.error}${err instanceof Error ? ` (${err.message})` : ""}` };
  }
}

export class RequiredError extends Error {}

export function required<T>(value: T | null | undefined | ""): T {
  if (value === null || value === undefined || value === "") throw new RequiredError("required");
  return value;
}

import type { Result } from "@/types/common";

/** Tạo Result thành công. */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Tạo Result lỗi. */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** Bọc một hàm có thể throw thành Result (đồng bộ). */
export function tryCatch<T>(fn: () => T): Result<T, Error> {
  try {
    return ok(fn());
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

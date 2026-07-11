import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Gộp className có điều kiện (clsx) + resolve xung đột Tailwind (tailwind-merge).
 * Dùng ở mọi component thay cho việc nối chuỗi className thủ công.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { z } from "zod";

/**
 * Validate biến môi trường bằng zod — fail-fast, tránh "undefined" âm thầm.
 * - `clientEnv`: biến công khai (NEXT_PUBLIC_*) — an toàn ở cả client lẫn server.
 * - `getServerEnv()`: biến BÍ MẬT (service_role) — parse LAZY, CHỈ gọi ở server.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, "Thiếu NEXT_PUBLIC_SUPABASE_URL")
    .startsWith("https://", "NEXT_PUBLIC_SUPABASE_URL phải bắt đầu bằng https://"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Thiếu NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  // URL gốc TIN CẬY của app (chống host-header injection ở link xác nhận email).
  // Optional cho dev; NÊN set ở production (Vercel) và dev (http://localhost:3000).
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .startsWith("http", "NEXT_PUBLIC_SITE_URL phải là URL http(s)")
    .optional(),
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Thiếu SUPABASE_SERVICE_ROLE_KEY"),
});

/** CHỈ gọi ở server (Server Action / Route Handler). Không import kết quả vào client. */
export function getServerEnv() {
  return serverEnvSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

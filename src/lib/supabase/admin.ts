import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { clientEnv, getServerEnv } from "@/config/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Client dùng SERVICE_ROLE — BYPASS toàn bộ RLS.
 * CHỈ được gọi ở server (seed, admin task đặc quyền). "server-only" chặn lỡ import vào client.
 */
export function createAdminClient() {
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
  return createSupabaseClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

import { createBrowserClient } from "@supabase/ssr";

import { clientEnv } from "@/config/env";
import type { Database } from "@/lib/supabase/database.types";

/** Supabase client cho Client Components (chạy ở browser). */
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

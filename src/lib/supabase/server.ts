import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { clientEnv } from "@/config/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Supabase client cho môi trường server (Server Components, Server Actions, Route Handlers).
 * Đọc/ghi session qua cookie store của Next.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Gọi từ Server Component (không set được cookie) — bỏ qua,
            // middleware sẽ refresh session.
          }
        },
      },
    },
  );
}

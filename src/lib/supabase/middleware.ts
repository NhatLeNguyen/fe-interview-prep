import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { clientEnv } from "@/config/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Refresh Supabase session ở middleware (chạy trước mọi request).
 * Đồng bộ cookie giữa request và response. Redirect theo auth để ở Phase 1.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // QUAN TRỌNG: gọi getUser() để refresh token (không đọc getSession()).
  await supabase.auth.getUser();

  return supabaseResponse;
}

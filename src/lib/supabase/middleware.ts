import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_PREFIX, GUEST_ONLY_PREFIXES, PROTECTED_PREFIXES, ROUTES } from "@/constants/routes";
import { clientEnv } from "@/config/env";
import type { Database } from "@/lib/supabase/database.types";

function matchesPrefix(path: string, prefixes: readonly string[]): boolean {
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
}

/** Chuyển hướng nhưng GIỮ LẠI cookie phiên vừa refresh (nếu không, session bị mất). */
function redirectPreservingCookies(
  request: NextRequest,
  pathname: string,
  from: NextResponse,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const response = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}

/**
 * Refresh Supabase session ở proxy (chạy trước mọi request) + guard truy cập:
 * - Chưa đăng nhập mà vào route bảo vệ -> /login.
 * - Đã đăng nhập mà vào /login,/signup -> /dashboard.
 * Access/refresh token do Supabase quản lý trong cookie httpOnly, tự refresh qua getUser().
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

  // QUAN TRỌNG: getUser() (không phải getSession()) để xác thực & refresh token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Admin: yêu cầu role=admin (defense-in-depth; RLS vẫn là ranh giới thật ở tầng DB).
  if (matchesPrefix(path, [ADMIN_PREFIX])) {
    if (!user) {
      return redirectPreservingCookies(request, ROUTES.LOGIN, supabaseResponse);
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role !== "admin") {
      return redirectPreservingCookies(request, ROUTES.DASHBOARD, supabaseResponse);
    }
    return supabaseResponse;
  }

  if (!user && matchesPrefix(path, PROTECTED_PREFIXES)) {
    return redirectPreservingCookies(request, ROUTES.LOGIN, supabaseResponse);
  }

  if (user && matchesPrefix(path, GUEST_ONLY_PREFIXES)) {
    return redirectPreservingCookies(request, ROUTES.DASHBOARD, supabaseResponse);
  }

  return supabaseResponse;
}

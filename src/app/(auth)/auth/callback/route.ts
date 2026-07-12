import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * Xử lý xác thực từ link email (xác nhận đăng ký + OAuth sau này).
 * - PKCE `?code=`     -> exchangeCodeForSession (cùng trình duyệt đã đăng ký).
 * - OTP  `?token_hash=&type=` -> verifyOtp (hoạt động cả khi mở link ở thiết bị khác).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  // Chỉ cho phép redirect nội bộ (chống open-redirect).
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : ROUTES.DASHBOARD;

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }

  return NextResponse.redirect(`${origin}${ROUTES.LOGIN}?error=auth`);
}

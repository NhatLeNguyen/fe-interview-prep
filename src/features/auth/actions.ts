"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { clientEnv } from "@/config/env";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "./schemas";
import type { AuthFormState } from "./types";

/** Dịch lỗi Supabase Auth sang thông báo tiếng Việt thân thiện (không lộ chi tiết kỹ thuật). */
function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email hoặc mật khẩu không đúng.";
  if (m.includes("email not confirmed")) return "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Email này đã được đăng ký. Hãy đăng nhập.";
  if (m.includes("rate limit") || m.includes("too many")) return "Thao tác quá nhanh, thử lại sau ít phút.";
  if (m.includes("weak password") || m.includes("password should")) return "Mật khẩu quá yếu (tối thiểu 6 ký tự).";
  return "Có lỗi xảy ra. Vui lòng thử lại.";
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: mapAuthError(error.message) };

  revalidatePath("/", "layout");
  redirect(ROUTES.DASHBOARD);
}

export async function signup(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
  }

  // URL gốc TIN CẬY: ưu tiên env đã cấu hình (chống host-header injection);
  // chỉ fallback header Origin cho dev. Nếu thiếu cả hai -> để Supabase dùng Site URL.
  const requestHeaders = await headers();
  const base = clientEnv.NEXT_PUBLIC_SITE_URL ?? requestHeaders.get("origin") ?? undefined;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: base ? { emailRedirectTo: `${base}${ROUTES.AUTH_CALLBACK}` } : undefined,
  });
  if (error) return { error: mapAuthError(error.message) };

  // Nếu Supabase TẮT "Confirm email" -> có session ngay -> vào dashboard.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect(ROUTES.DASHBOARD);
  }

  // Ngược lại: cần xác nhận qua email (link trỏ về /auth/callback).
  return { notice: "Đã gửi email xác nhận. Vui lòng kiểm tra hộp thư để kích hoạt tài khoản." };
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(ROUTES.LOGIN);
}

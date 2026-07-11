import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Proxy (thay cho "middleware" — chuẩn Next 16): refresh session Supabase trước mỗi request.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Bỏ qua static assets & ảnh. Áp cho mọi route còn lại để refresh session.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

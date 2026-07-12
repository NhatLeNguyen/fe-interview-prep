"use client";

import { useSearchParams } from "next/navigation";

/** Hiển thị cảnh báo khi callback xác thực thất bại (?error=auth). Query-param UI-only -> client. */
export function LoginErrorAlert() {
  const error = useSearchParams().get("error");
  if (error !== "auth") return null;

  return (
    <p role="alert" className="text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm">
      Liên kết xác nhận không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập, hoặc đăng ký lại để nhận
      email mới.
    </p>
  );
}

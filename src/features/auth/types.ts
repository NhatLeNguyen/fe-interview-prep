/** State trả về từ auth server actions (dùng với useActionState). */
export interface AuthFormState {
  /** Thông báo lỗi (hiển thị đỏ). */
  error?: string;
  /** Thông báo trung tính (vd: cần xác nhận email). */
  notice?: string;
}

export const AUTH_FORM_INITIAL: AuthFormState = {};

/** Kiểu dùng chung toàn app — thuần TypeScript, không phụ thuộc runtime. */

export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;

/** Result kiểu Rust — dùng cho hàm có thể lỗi mà không throw. Xem helpers/result.ts. */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Trạng thái tải dữ liệu ở UI. */
export type LoadState = "idle" | "loading" | "success" | "error";

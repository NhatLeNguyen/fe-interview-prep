import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { Tables } from "@/types/db";

type Client = SupabaseClient<Database>;

/** Đọc thông tin phiên/hồ sơ ở phía server (RSC / Server Action). */
export const authApi = {
  /** User hiện tại (đã xác thực qua getUser — an toàn hơn getSession). */
  async getUser(client: Client): Promise<User | null> {
    const {
      data: { user },
    } = await client.auth.getUser();
    return user;
  },

  /** Hồ sơ (profiles) của user hiện tại; null nếu chưa đăng nhập. */
  async getProfile(client: Client): Promise<Tables<"profiles"> | null> {
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return null;

    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },
};

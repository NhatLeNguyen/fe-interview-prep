import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/features/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const user = await authApi.getUser(supabase);
  // Guard server-side (belt-and-suspenders — không chỉ dựa vào proxy; RLS là ranh giới cuối).
  if (!user) redirect(ROUTES.LOGIN);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          Xin chào{profile?.full_name ? `, ${profile.full_name}` : ""} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Bạn đã đăng nhập bằng <span className="text-foreground font-medium">{user.email}</span>.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dashboard tiến độ</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Streak, &quot;Ôn tập hôm nay&quot;, % hoàn thành theo chủ đề và hoạt động gần đây sẽ được bổ
          sung ở các bước tiếp theo của Phase 1.
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";

import { HeaderNav } from "@/components/layout/header-nav";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/features/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const user = await authApi.getUser(supabase);
  const isAdmin =
    user != null &&
    (await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()).data?.role ===
      "admin";

  const items = [
    { href: ROUTES.QUESTIONS, label: "Câu hỏi" },
    { href: ROUTES.LEARNING_PATH, label: "Lộ trình" },
    ...(user
      ? [
          { href: ROUTES.REVIEW, label: "Ôn tập" },
          { href: ROUTES.QUIZ, label: "Quiz" },
          { href: ROUTES.BOOKMARKS, label: "Đã lưu" },
          { href: ROUTES.DASHBOARD, label: "Tiến độ" },
          ...(isAdmin ? [{ href: ROUTES.ADMIN, label: "Admin" }] : []),
        ]
      : []),
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-background/80 sticky top-0 z-20 border-b backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href={ROUTES.HOME} className="font-semibold tracking-tight">
            {siteConfig.shortName}
          </Link>
          <HeaderNav items={items} email={user?.email ?? ""} isAuthenticated={Boolean(user)} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}

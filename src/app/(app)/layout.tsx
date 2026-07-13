import Link from "next/link";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";
import { authApi, UserMenu } from "@/features/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const user = await authApi.getUser(supabase);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-background/80 sticky top-0 z-20 border-b backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href={ROUTES.HOME} className="font-semibold tracking-tight">
            {siteConfig.shortName}
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href={ROUTES.QUESTIONS}
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
            >
              Câu hỏi
            </Link>
            {user ? (
              <>
                <Link
                  href={ROUTES.REVIEW}
                  className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
                >
                  Ôn tập
                </Link>
                <Link
                  href={ROUTES.QUIZ}
                  className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
                >
                  Quiz
                </Link>
                <Link
                  href={ROUTES.BOOKMARKS}
                  className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
                >
                  Đã lưu
                </Link>
                <Link
                  href={ROUTES.DASHBOARD}
                  className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
                >
                  Tiến độ
                </Link>
                <UserMenu email={user.email ?? ""} />
              </>
            ) : (
              <Link href={ROUTES.LOGIN} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Đăng nhập
              </Link>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}

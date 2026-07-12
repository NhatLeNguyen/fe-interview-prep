import Link from "next/link";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/features/auth";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const user = await authApi.getUser(supabase);

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="font-semibold tracking-tight">{siteConfig.name}</span>
        <div className="flex items-center gap-2">
          {user ? (
            <Link href={ROUTES.DASHBOARD} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Vào Dashboard
            </Link>
          ) : (
            <Link href={ROUTES.LOGIN} className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Đăng nhập
            </Link>
          )}
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <span className="text-muted-foreground rounded-full border px-3 py-1 font-mono text-xs">
          Phase 1 · ngân hàng câu hỏi + đăng nhập
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Luyện phỏng vấn Front-end, junior đến senior
        </h1>
        <p className="text-muted-foreground text-lg text-pretty">{siteConfig.description}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <Link href={ROUTES.DASHBOARD} className={buttonVariants({ size: "lg" })}>
              Vào Dashboard
            </Link>
          ) : (
            <Link href={ROUTES.SIGNUP} className={buttonVariants({ size: "lg" })}>
              Bắt đầu miễn phí
            </Link>
          )}
          <Link href={ROUTES.QUESTIONS} className={buttonVariants({ variant: "outline", size: "lg" })}>
            Xem câu hỏi
          </Link>
        </div>
      </section>

      <footer className="text-muted-foreground border-t px-6 py-4 text-center text-sm">
        © 2026 {siteConfig.name} — bản quyền nội dung học tập.
      </footer>
    </main>
  );
}

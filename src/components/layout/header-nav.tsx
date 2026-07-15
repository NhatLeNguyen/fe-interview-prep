"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { UserMenu } from "@/features/auth";
import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  /** Số hiển thị trên badge (vd thẻ đến hạn). Bỏ qua nếu 0/undefined. */
  badge?: number;
}

const linkClass =
  "text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors";

function NavBadge({ count }: { count: number }) {
  return (
    <span
      aria-label={`${count} thẻ đến hạn`}
      className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold tabular-nums"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Nav header: hàng ngang trên desktop, hamburger + dropdown trên mobile. */
export function HeaderNav({
  items,
  email,
  isAuthenticated,
}: {
  items: NavItem[];
  email: string;
  isAuthenticated: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <nav className="hidden items-center gap-1 md:flex">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className={linkClass}>
            {i.label}
            {i.badge ? <NavBadge count={i.badge} /> : null}
          </Link>
        ))}
      </nav>

      {isAuthenticated ? (
        <UserMenu email={email} />
      ) : (
        <Link href={ROUTES.LOGIN} className={buttonVariants({ variant: "outline", size: "sm" })}>
          Đăng nhập
        </Link>
      )}
      <ThemeToggle />

      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label={open ? "Đóng menu" : "Mở menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </Button>

      {open ? (
        <div className="bg-background absolute inset-x-0 top-14 z-30 border-b shadow-sm md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 p-4">
            {items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className={cn(linkClass, "py-2.5")}
                onClick={() => setOpen(false)}
              >
                {i.label}
                {i.badge ? <NavBadge count={i.badge} /> : null}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}

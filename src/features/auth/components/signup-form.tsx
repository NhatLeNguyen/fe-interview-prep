"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { signup } from "../actions";
import { AUTH_FORM_INITIAL } from "../types";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, AUTH_FORM_INITIAL);

  if (state.notice) {
    return (
      <div
        className="flex flex-col items-center gap-3 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
          <MailCheck className="size-6" />
        </div>
        <p className="font-medium">Kiểm tra email của bạn</p>
        <p className="text-muted-foreground text-sm">{state.notice}</p>
        <Link href={ROUTES.LOGIN} className={buttonVariants({ variant: "outline" })}>
          Về trang đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="ban@email.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="Tối thiểu 6 ký tự"
        />
      </div>

      {state.error ? (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Đang tạo tài khoản…" : "Đăng ký"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Đã có tài khoản?{" "}
        <Link href={ROUTES.LOGIN} className="text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}

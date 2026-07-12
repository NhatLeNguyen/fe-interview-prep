"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { login } from "../actions";
import { AUTH_FORM_INITIAL } from "../types";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, AUTH_FORM_INITIAL);

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
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      {state.error ? (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Chưa có tài khoản?{" "}
        <Link href={ROUTES.SIGNUP} className="text-primary hover:underline">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}

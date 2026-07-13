import type { Metadata } from "next";
import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { LoginErrorAlert, LoginForm } from "@/features/auth";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <h1 className="font-heading text-base leading-snug font-medium">Đăng nhập</h1>
        <CardDescription>Chào mừng trở lại 👋</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Suspense fallback={null}>
          <LoginErrorAlert />
        </Suspense>
        <LoginForm />
      </CardContent>
    </Card>
  );
}

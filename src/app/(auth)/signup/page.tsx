import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { SignupForm } from "@/features/auth";

export const metadata: Metadata = { title: "Đăng ký" };

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <h1 className="font-heading text-base leading-snug font-medium">Tạo tài khoản</h1>
        <CardDescription>Bắt đầu luyện phỏng vấn Front-end miễn phí.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  );
}

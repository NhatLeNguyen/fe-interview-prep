import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LevelBadge } from "@/components/common/level-badge";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/features/auth";
import { InterviewRunner, interviewApi, SessionSummary } from "@/features/interview";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Phiên phỏng vấn" };

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function InterviewSessionPage({ params }: PageProps) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const user = await authApi.getUser(supabase);
  if (!user) redirect(ROUTES.LOGIN);

  // RLS chỉ cho owner đọc -> phiên của người khác trả null -> 404.
  const session = await interviewApi.getSession(supabase, sessionId);
  if (!session) notFound();

  // Admin đọc được mọi phiên (RLS admin_read) -> chỉ cho XEM, không render runner có thể thao tác.
  const isOwner = session.userId === user.id;
  const done = session.status === "completed" || !isOwner;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={ROUTES.INTERVIEW}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Phỏng vấn thử
      </Link>

      <header className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {done ? "Tổng kết phiên" : "Phiên phỏng vấn"}
        </h1>
        <LevelBadge level={session.level} />
      </header>

      {done ? <SessionSummary session={session} /> : <InterviewRunner session={session} />}
    </div>
  );
}

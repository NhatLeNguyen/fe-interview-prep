import { ArrowLeft, ListChecks } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { LevelBadge } from "@/components/common/level-badge";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/features/auth";
import { learningPathApi, PathChecklist } from "@/features/learning-path";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ pathSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pathSlug } = await params;
  const supabase = await createClient();
  const meta = await learningPathApi.getPathMeta(supabase, pathSlug);
  if (!meta) return { title: "Lộ trình" };
  return { title: meta.title, description: meta.description ?? undefined };
}

export default async function PathDetailPage({ params }: PageProps) {
  const { pathSlug } = await params;
  const supabase = await createClient();
  const user = await authApi.getUser(supabase);
  const path = await learningPathApi.getPath(supabase, pathSlug, user?.id ?? null);
  if (!path) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={ROUTES.LEARNING_PATH}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Lộ trình học
      </Link>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{path.title}</h1>
          <LevelBadge level={path.target_level} />
        </div>
        {path.description ? <p className="text-muted-foreground">{path.description}</p> : null}
      </header>

      {path.totalItems === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Lộ trình chưa có nội dung"
          description="Các bước học sẽ xuất hiện ở đây khi được thêm vào."
        />
      ) : (
        <PathChecklist
          pathId={path.id}
          slug={path.slug}
          modules={path.modules}
          isAuthenticated={Boolean(user)}
        />
      )}
    </div>
  );
}

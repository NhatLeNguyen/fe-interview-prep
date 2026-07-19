import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ROUTES } from "@/constants/routes";
import { authApi } from "@/features/auth";
import { CertQuizButton, certsApi, StudyList } from "@/features/certs";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ trackSlug: string; topicSlug: string }>;
}

const loadStudy = cache(async (trackSlug: string, topicSlug: string) => {
  const supabase = await createClient();
  return certsApi.getTopicStudy(supabase, trackSlug, topicSlug);
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { trackSlug, topicSlug } = await params;
  const study = await loadStudy(trackSlug, topicSlug);
  return { title: study ? study.topicName : "Ôn thi chứng chỉ" };
}

export default async function CertTopicPage({ params }: PageProps) {
  const { trackSlug, topicSlug } = await params;
  const supabase = await createClient();
  const [user, study] = await Promise.all([
    authApi.getUser(supabase),
    loadStudy(trackSlug, topicSlug),
  ]);
  if (!study) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={ROUTES.CERT_TRACK(trackSlug)}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        {study.trackName}
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{study.topicName}</h1>
        <CertQuizButton trackSlug={trackSlug} topicSlug={topicSlug} label="Làm quiz phần này" />
      </header>

      <StudyList items={study.items} isAuthenticated={Boolean(user)} />
    </div>
  );
}

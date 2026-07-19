import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ROUTES } from "@/constants/routes";
import { certsApi, DomainList } from "@/features/certs";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ trackSlug: string }>;
}

const loadTrack = cache(async (trackSlug: string) => {
  const supabase = await createClient();
  return certsApi.getTrack(supabase, trackSlug);
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { trackSlug } = await params;
  const track = await loadTrack(trackSlug);
  return { title: track ? track.name : "Ôn thi chứng chỉ" };
}

export default async function CertTrackPage({ params }: PageProps) {
  const { trackSlug } = await params;
  const track = await loadTrack(trackSlug);
  if (!track) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={ROUTES.CERTS}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Ôn thi chứng chỉ
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{track.name}</h1>
        {track.description ? <p className="text-muted-foreground">{track.description}</p> : null}
      </header>

      <DomainList trackSlug={track.slug} domains={track.domains} />
    </div>
  );
}

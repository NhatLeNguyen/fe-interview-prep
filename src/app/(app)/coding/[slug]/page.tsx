import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ROUTES } from "@/constants/routes";
import { authApi } from "@/features/auth";
import { codingApi, CodingWorkspace } from "@/features/coding";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Dedup trong 1 request: generateMetadata + page dùng chung 1 lần fetch.
const loadProblem = cache(async (slug: string) => {
  const supabase = await createClient();
  return codingApi.getProblem(supabase, slug);
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const problem = await loadProblem(slug);
  return { title: problem ? problem.title : "Luyện code" };
}

export default async function CodingProblemPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const user = await authApi.getUser(supabase);
  const problem = await loadProblem(slug);
  if (!problem) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={ROUTES.CODING}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Luyện code
      </Link>

      <header className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{problem.title}</h1>
      </header>

      <CodingWorkspace problem={problem} isAuthenticated={Boolean(user)} />
    </div>
  );
}

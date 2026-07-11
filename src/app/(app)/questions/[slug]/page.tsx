import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DifficultyDots } from "@/components/common/difficulty-dots";
import { LevelBadge } from "@/components/common/level-badge";
import { Badge } from "@/components/ui/badge";
import { QUESTION_TYPE_LABELS } from "@/constants/taxonomy";
import { ROUTES } from "@/constants/routes";
import { questionsApi } from "@/features/questions";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function QuestionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const question = await questionsApi.getBySlug(supabase, slug);

  if (!question) notFound();

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          href={ROUTES.QUESTIONS}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          Ngân hàng câu hỏi
        </Link>
      </div>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {question.topic?.category ? (
            <Badge variant="secondary" className="font-normal">
              {question.topic.category.name}
            </Badge>
          ) : null}
          {question.topic ? (
            <Badge variant="outline" className="text-muted-foreground font-normal">
              {question.topic.name}
            </Badge>
          ) : null}
          <LevelBadge level={question.level} />
          <Badge variant="outline" className="text-muted-foreground font-normal">
            {QUESTION_TYPE_LABELS[question.type]}
          </Badge>
          <DifficultyDots value={question.difficulty} className="ml-auto" />
        </div>
        <h1 className="text-2xl leading-snug font-bold tracking-tight text-balance">
          {question.prompt_md.replace(/[#*`>_]/g, "")}
        </h1>
      </header>

      {question.code_snippet ? (
        <pre className="bg-muted overflow-x-auto rounded-lg border p-4 text-sm">
          <code>{question.code_snippet}</code>
        </pre>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
          Đáp án
        </h2>
        <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {question.answer_md ?? "Câu hỏi này chưa có đáp án."}
        </div>
      </section>

      {question.tags.length > 0 ? (
        <footer className="flex flex-wrap gap-1.5 border-t pt-6">
          {question.tags.map((tag) => (
            <Badge key={tag.slug} variant="secondary" className="font-normal">
              #{tag.name}
            </Badge>
          ))}
        </footer>
      ) : null}
    </article>
  );
}

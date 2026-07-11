import Link from "next/link";

import { DifficultyDots } from "@/components/common/difficulty-dots";
import { LevelBadge } from "@/components/common/level-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { QUESTION_TYPE_LABELS } from "@/constants/taxonomy";
import { ROUTES } from "@/constants/routes";
import { truncate } from "@/helpers/string";
import type { QuestionListItem } from "../types";

export function QuestionCard({ question }: { question: QuestionListItem }) {
  return (
    <Link href={ROUTES.QUESTION_DETAIL(question.slug)} className="group block">
      <Card className="hover:border-primary/40 h-full gap-0 transition-colors">
        <CardHeader className="gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {question.topic?.category ? (
              <Badge variant="secondary" className="font-normal">
                {question.topic.category.name}
              </Badge>
            ) : null}
            <LevelBadge level={question.level} />
            <Badge variant="outline" className="text-muted-foreground font-normal">
              {QUESTION_TYPE_LABELS[question.type]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          <p className="group-hover:text-primary line-clamp-3 font-medium text-pretty transition-colors">
            {truncate(question.prompt_md.replace(/[#*`>_]/g, ""), 160)}
          </p>
        </CardContent>
        <CardFooter className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
          <span>{question.topic?.name ?? "—"}</span>
          <DifficultyDots value={question.difficulty} />
        </CardFooter>
      </Card>
    </Link>
  );
}

import { BookOpen } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import type { CertDomain } from "../types";
import { CertQuizButton } from "./cert-quiz-button";

export function DomainList({ trackSlug, domains }: { trackSlug: string; domains: CertDomain[] }) {
  return (
    <div className="space-y-6">
      {domains.map((d) => (
        <section key={d.slug} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">{d.name}</h2>
            <CertQuizButton trackSlug={trackSlug} categorySlug={d.slug} label="Quiz lĩnh vực này" />
          </div>
          <ul className="space-y-1.5">
            {d.topics.map((tp) => (
              <li key={tp.slug}>
                <Link
                  href={ROUTES.CERT_TOPIC(trackSlug, tp.slug)}
                  className="hover:bg-muted flex items-center justify-between gap-3 rounded-lg border p-3 text-sm transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <BookOpen className="text-muted-foreground size-4 shrink-0" />
                    {tp.name}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {tp.studyCount} học · {tp.quizCount} quiz
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

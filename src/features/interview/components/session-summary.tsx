import { RATING_LABELS } from "../constants";
import type { InterviewSessionDetail } from "../types";

const plain = (md: string) => md.replace(/[#*`>_]/g, "");

export function SessionSummary({ session }: { session: InterviewSessionDetail }) {
  const score = session.selfScore ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-1 py-4 text-center">
        <h2 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Điểm tự chấm
        </h2>
        <p className="text-primary text-5xl font-bold tracking-tight tabular-nums">{score}%</p>
        <p className="text-muted-foreground text-sm">
          {session.items.length} câu · trung bình{" "}
          {(Math.round((score / 100) * 5 * 10) / 10).toFixed(1)}/5
        </p>
      </div>

      <div className="space-y-4">
        {session.items.map((it, i) => (
          <div key={it.questionId} className="space-y-3 rounded-xl border p-4">
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>
                Câu {i + 1}
                {it.topicName ? ` · ${it.topicName}` : ""}
              </span>
              {it.selfRating != null ? (
                <span className="font-medium">
                  {it.selfRating}/5 · {RATING_LABELS[it.selfRating]}
                </span>
              ) : (
                <span>Chưa trả lời</span>
              )}
            </div>

            <p className="font-medium">{plain(it.promptMd)}</p>

            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Câu trả lời của bạn
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {it.answerText?.trim() ? it.answerText : "(bỏ trống)"}
              </p>
            </div>

            {it.answerMd ? (
              <div className="bg-muted/50 space-y-1 rounded-lg border p-3">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Đáp án tham khảo
                </p>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {plain(it.answerMd)}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

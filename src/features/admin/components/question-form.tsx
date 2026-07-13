"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DIFFICULTY_SCALE,
  LEVEL_LABELS,
  LEVELS,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
} from "@/constants/taxonomy";
import type { Tables } from "@/types/db";
import { saveQuestion } from "../actions";
import type { TopicOption } from "../api/admin.api";
import { ADMIN_FORM_INITIAL } from "../types";

const FIELD =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3";

export function QuestionForm({
  topics,
  question,
}: {
  topics: TopicOption[];
  question?: Tables<"questions"> | null;
}) {
  const [state, action, pending] = useActionState(saveQuestion, ADMIN_FORM_INITIAL);
  const q = question;

  return (
    <form action={action} className="space-y-5">
      {q ? <input type="hidden" name="id" value={q.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Chủ đề *</Label>
          <Select name="topic_id" defaultValue={q?.topic_id ?? undefined}>
            <SelectTrigger className="w-full" aria-label="Chủ đề">
              <SelectValue placeholder="Chọn chủ đề" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.category} · {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Dạng *</Label>
          <Select name="type" defaultValue={q?.type ?? "theory"}>
            <SelectTrigger className="w-full" aria-label="Dạng câu hỏi">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {QUESTION_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Cấp độ *</Label>
          <Select name="level" defaultValue={q?.level ?? "junior"}>
            <SelectTrigger className="w-full" aria-label="Cấp độ">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {LEVEL_LABELS[l]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Độ khó</Label>
            <Select name="difficulty" defaultValue={String(q?.difficulty ?? 1)}>
              <SelectTrigger className="w-full" aria-label="Độ khó">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_SCALE.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Độ phổ biến</Label>
            <Select name="frequency" defaultValue={String(q?.frequency ?? 1)}>
              <SelectTrigger className="w-full" aria-label="Độ phổ biến">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_SCALE.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt_md">Đề bài (Markdown) *</Label>
        <textarea
          id="prompt_md"
          name="prompt_md"
          rows={3}
          defaultValue={q?.prompt_md ?? ""}
          className={FIELD}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="answer_md">Đáp án (Markdown)</Label>
        <textarea
          id="answer_md"
          name="answer_md"
          rows={6}
          defaultValue={q?.answer_md ?? ""}
          className={FIELD}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code_snippet">Code (tuỳ chọn)</Label>
          <textarea
            id="code_snippet"
            name="code_snippet"
            rows={3}
            defaultValue={q?.code_snippet ?? ""}
            className={`${FIELD} font-mono`}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code_language">Ngôn ngữ code</Label>
          <Input id="code_language" name="code_language" defaultValue={q?.code_language ?? ""} placeholder="js / ts / css…" />
        </div>
      </div>

      <fieldset className="space-y-3 rounded-lg border p-4">
        <legend className="text-muted-foreground px-1 text-xs">Chỉ dùng khi Dạng = Trắc nghiệm (quiz)</legend>
        <div className="space-y-2">
          <Label>Định dạng đáp án</Label>
          <Select name="answer_format" defaultValue={q?.answer_format ?? "single_choice"}>
            <SelectTrigger className="w-full" aria-label="Định dạng đáp án">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single_choice">1 đáp án đúng</SelectItem>
              <SelectItem value="multiple_choice">Nhiều đáp án đúng</SelectItem>
              <SelectItem value="true_false">Đúng / Sai</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="options_json">
            Options (JSON): {`[{"key":"a","text":"...","explanation":"..."}]`}
          </Label>
          <textarea
            id="options_json"
            name="options_json"
            rows={4}
            defaultValue={q?.options ? JSON.stringify(q.options, null, 2) : ""}
            className={`${FIELD} font-mono text-xs`}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="correct_keys">Đáp án đúng (key, phẩy ngăn cách): vd a hoặc a,c</Label>
          <Input
            id="correct_keys"
            name="correct_keys"
            defaultValue={q?.correct_keys?.join(", ") ?? ""}
            className="font-mono"
          />
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={q ? q.is_published : true}
          className="size-4"
        />
        Publish (hiển thị công khai)
      </label>

      {state.error ? (
        <p role="alert" className="text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Đang lưu…" : q ? "Cập nhật" : "Tạo câu hỏi"}
      </Button>
    </form>
  );
}

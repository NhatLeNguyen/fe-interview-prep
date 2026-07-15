"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEVEL_LABELS, LEVELS } from "@/constants/taxonomy";
import type { CategoryOption } from "@/features/questions";
import { startInterview } from "../actions";
import { INTERVIEW_ALL, INTERVIEW_COUNT_OPTIONS, INTERVIEW_DEFAULT_COUNT } from "../constants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Đang tạo phiên…" : "Bắt đầu phỏng vấn"}
    </Button>
  );
}

export function InterviewBuilder({ categories }: { categories: CategoryOption[] }) {
  return (
    <form action={startInterview} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Chủ đề</Label>
          <Select name="category" defaultValue={INTERVIEW_ALL}>
            <SelectTrigger className="w-full" aria-label="Chủ đề">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={INTERVIEW_ALL}>Tất cả chủ đề</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Cấp độ</Label>
          <Select name="level" defaultValue={INTERVIEW_ALL}>
            <SelectTrigger className="w-full" aria-label="Cấp độ">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={INTERVIEW_ALL}>Mọi cấp độ</SelectItem>
              {LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {LEVEL_LABELS[l]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Số câu</Label>
          <Select name="count" defaultValue={String(INTERVIEW_DEFAULT_COUNT)}>
            <SelectTrigger className="w-full" aria-label="Số câu">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTERVIEW_COUNT_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} câu
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}

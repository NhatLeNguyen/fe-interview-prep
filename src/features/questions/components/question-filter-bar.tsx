"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEVELS, LEVEL_LABELS, QUESTION_TYPES, QUESTION_TYPE_LABELS } from "@/constants/taxonomy";
import { ALL_VALUE, QUESTION_SORTS } from "../constants";
import { useQuestionFilters } from "../hooks/use-question-filters";
import type { CategoryOption } from "../types";

export function QuestionFilterBar({ categories }: { categories: CategoryOption[] }) {
  const { values, setSearch, setLevel, setType, setCategory, setSort, clearAll } =
    useQuestionFilters();

  const hasActive =
    Boolean(values.search) ||
    values.level !== ALL_VALUE ||
    values.type !== ALL_VALUE ||
    values.category !== ALL_VALUE;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={values.search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm câu hỏi (vd: closure, event loop)…"
          className="pl-9"
          aria-label="Tìm câu hỏi"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={values.category} onValueChange={setCategory}>
          <SelectTrigger className="w-40" aria-label="Lọc theo chủ đề">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Tất cả chủ đề</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={values.level} onValueChange={setLevel}>
          <SelectTrigger className="w-32" aria-label="Lọc theo cấp độ">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Mọi cấp độ</SelectItem>
            {LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {LEVEL_LABELS[level]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={values.type} onValueChange={setType}>
          <SelectTrigger className="w-36" aria-label="Lọc theo dạng câu hỏi">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Mọi dạng</SelectItem>
            {QUESTION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {QUESTION_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={values.sort} onValueChange={setSort}>
          <SelectTrigger className="w-36" aria-label="Sắp xếp">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_SORTS.map((sort) => (
              <SelectItem key={sort.value} value={sort.value}>
                {sort.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActive ? (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X className="size-4" />
            Xoá bộ lọc
          </Button>
        ) : null}
      </div>
    </div>
  );
}

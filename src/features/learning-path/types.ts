import type { Enums } from "@/types/db";

export interface PathSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  target_level: Enums<"level">;
  totalItems: number;
  completedItems: number;
}

export interface PathItem {
  id: string;
  title: string;
  moduleTitle: string;
  stepKey: string | null;
  isOptional: boolean;
  completed: boolean;
  /** Link tới nội dung của item (topic -> câu hỏi lọc, question -> chi tiết). null nếu chưa nối được. */
  href: string | null;
}

export interface PathModule {
  title: string;
  items: PathItem[];
}

export interface PathDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  target_level: Enums<"level">;
  modules: PathModule[];
  totalItems: number;
  completedItems: number;
}

/** 1 thẻ trong hàng đợi ôn tập (nội dung câu hỏi). */
export interface ReviewCard {
  id: string;
  slug: string;
  prompt_md: string;
  answer_md: string | null;
  code_snippet: string | null;
  code_language: string | null;
}

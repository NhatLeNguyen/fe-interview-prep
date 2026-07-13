/** 4 mức tự đánh giá khi ôn (map sang grade 0–5 cho thuật toán SM-2). */
export const REVIEW_GRADES = [
  { grade: 0, label: "Quên", hint: "Học lại", tone: "danger" },
  { grade: 3, label: "Khó", hint: "Nhớ nhưng khó", tone: "warn" },
  { grade: 4, label: "Được", hint: "Nhớ ổn", tone: "default" },
  { grade: 5, label: "Dễ", hint: "Rất nhớ", tone: "good" },
] as const;

export type ReviewGradeTone = (typeof REVIEW_GRADES)[number]["tone"];

/** Số thẻ tối đa lấy ra mỗi phiên ôn. */
export const REVIEW_QUEUE_LIMIT = 30;

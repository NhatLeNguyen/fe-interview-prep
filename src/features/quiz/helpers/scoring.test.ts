import { describe, expect, it } from "vitest";

import { isAnswerCorrect, scoreQuiz } from "./scoring";

describe("isAnswerCorrect", () => {
  it("single choice: đúng key", () => {
    expect(isAnswerCorrect(["b"], ["b"])).toBe(true);
    expect(isAnswerCorrect(["a"], ["b"])).toBe(false);
  });

  it("multiple choice: phải khớp ĐÚNG toàn bộ tập", () => {
    expect(isAnswerCorrect(["a", "c"], ["c", "a"])).toBe(true); // thứ tự không quan trọng
    expect(isAnswerCorrect(["a"], ["a", "c"])).toBe(false); // thiếu
    expect(isAnswerCorrect(["a", "b", "c"], ["a", "c"])).toBe(false); // thừa
  });

  it("không chọn gì / không có đáp án đúng -> sai", () => {
    expect(isAnswerCorrect([], ["a"])).toBe(false);
    expect(isAnswerCorrect(["a"], [])).toBe(false);
  });
});

describe("scoreQuiz", () => {
  it("tính đúng số câu đúng + phần trăm", () => {
    const result = scoreQuiz([
      { questionId: "1", selectedKeys: ["a"], correctKeys: ["a"] },
      { questionId: "2", selectedKeys: ["b"], correctKeys: ["c"] },
      { questionId: "3", selectedKeys: ["a", "b"], correctKeys: ["a", "b"] },
      { questionId: "4", selectedKeys: [], correctKeys: ["d"] },
    ]);
    expect(result.correct).toBe(2);
    expect(result.total).toBe(4);
    expect(result.percent).toBe(50);
    expect(result.answers[1].isCorrect).toBe(false);
  });

  it("bài rỗng -> 0%", () => {
    expect(scoreQuiz([]).percent).toBe(0);
  });
});

import { describe, expect, it } from "vitest";

import { initials, slugify, truncate } from "./string";

describe("slugify", () => {
  it("bỏ dấu tiếng Việt và tạo kebab-case", () => {
    expect(slugify("Cơ chế Event Loop")).toBe("co-che-event-loop");
    expect(slugify("Closure là gì?")).toBe("closure-la-gi");
    expect(slugify("  Đáp án  ")).toBe("dap-an");
  });

  it("gộp ký tự không phải chữ/số thành một gạch nối", () => {
    expect(slugify("a  --  b__c")).toBe("a-b-c");
  });
});

describe("truncate", () => {
  it("cắt chuỗi dài và thêm hậu tố", () => {
    expect(truncate("hello world", 5)).toBe("hell…");
  });

  it("giữ nguyên chuỗi ngắn hơn giới hạn", () => {
    expect(truncate("hi", 5)).toBe("hi");
  });
});

describe("initials", () => {
  it("lấy tối đa 2 chữ cái đầu, viết hoa", () => {
    expect(initials("Nhat Le Nguyen")).toBe("NL");
    expect(initials("react")).toBe("R");
  });
});

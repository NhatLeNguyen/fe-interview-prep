/** Chỉ cho phép tên hàm là identifier JS hợp lệ — chống chèn code qua function_name. */
const FN_NAME_RE = /^[A-Za-z_$][\w$]*$/;

/**
 * Ghép source JS gửi lên sandbox. Sandbox CHỈ gọi hàm với từng bộ args và
 * TRẢ VỀ giá trị (đã serialize) — KHÔNG chứa `expected`, KHÔNG so sánh.
 * Mọi so sánh pass/fail làm ở SERVER (realm tin cậy) -> user không thể:
 *   - đọc đáp án (expected không vào sandbox),
 *   - ghi đè built-ins để chấm sai (so sánh không nằm trong sandbox).
 * `marker` là nonce mỗi lần chạy (server sinh) -> chống giả mạo dòng kết quả.
 * THUẦN — không import React. Throw nếu functionName không hợp lệ.
 */
export function buildHarness(input: {
  userCode: string;
  functionName: string;
  argsList: unknown[][];
  marker: string;
  maxGotLen: number;
}): string {
  const { userCode, functionName, argsList, marker, maxGotLen } = input;
  if (!FN_NAME_RE.test(functionName)) {
    throw new Error(`Tên hàm không hợp lệ: ${functionName}`);
  }
  const argsJson = JSON.stringify(argsList);
  const fnLiteral = JSON.stringify(functionName);
  const markerLiteral = JSON.stringify(marker);

  return `// PROLOGUE: bắt giữ built-in TRƯỚC code user (user không thể làm hỏng chúng).
var __stringify = JSON.stringify;
var __log = console.log.bind(console);
var __slice = Function.prototype.call.bind(String.prototype.slice);
${userCode}

;(function () {
  var __args = ${argsJson};
  var __results = [];
  for (var __i = 0; __i < __args.length; __i++) {
    var __gotStr = null, __err = null;
    try {
      var __fn = (typeof ${functionName} === "function")
        ? ${functionName}
        : (typeof globalThis !== "undefined" ? globalThis[${fnLiteral}] : undefined);
      if (typeof __fn !== "function") throw new Error("Không tìm thấy hàm " + ${fnLiteral});
      var __got = __fn.apply(null, __args[__i]);
      __gotStr = __stringify(__got);
      if (typeof __gotStr === "string" && __gotStr.length > ${maxGotLen}) __gotStr = __slice(__gotStr, 0, ${maxGotLen});
    } catch (e) {
      __err = String((e && e.message) || e);
      if (__err.length > ${maxGotLen}) __err = __slice(__err, 0, ${maxGotLen});
    }
    __results.push({ i: __i, got: __gotStr, error: __err });
  }
  __log(${markerLiteral} + __stringify({ results: __results }));
})();
`;
}

import { RESULT_MARKER } from "../constants";

/** Chỉ cho phép tên hàm là identifier JS hợp lệ — chống chèn code qua function_name. */
const FN_NAME_RE = /^[A-Za-z_$][\w$]*$/;

/** Bản deepEqual chạy TRONG Piston (nhúng dưới dạng source string). */
const DEEP_EQUAL_SRC = `function __deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number" && a !== a && b !== b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  var aArr = Array.isArray(a), bArr = Array.isArray(b);
  if (aArr !== bArr) return false;
  if (aArr) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (!__deepEqual(a[i], b[i])) return false;
    return true;
  }
  var ak = Object.keys(a), bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (var j = 0; j < ak.length; j++) {
    var k = ak[j];
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!__deepEqual(a[k], b[k])) return false;
  }
  return true;
}`;

/**
 * Ghép source JS gửi lên Piston: code của user + runner gọi functionName với từng
 * test case, so sánh sâu với expected, in RESULT_MARKER + JSON kết quả ra stdout.
 * THUẦN — không import React. Throw nếu functionName không hợp lệ.
 */
export function buildHarness(input: {
  userCode: string;
  functionName: string;
  cases: { args: unknown[]; expected: unknown }[];
}): string {
  const { userCode, functionName, cases } = input;
  if (!FN_NAME_RE.test(functionName)) {
    throw new Error(`Tên hàm không hợp lệ: ${functionName}`);
  }
  const casesJson = JSON.stringify(cases);
  const fnLiteral = JSON.stringify(functionName);

  return `${userCode}

;(function () {
  ${DEEP_EQUAL_SRC}
  function __safe(v) {
    try { var s = JSON.stringify(v); return s === undefined ? String(v) : s; }
    catch (e) { return String(v); }
  }
  var __cases = ${casesJson};
  var __results = [];
  for (var __i = 0; __i < __cases.length; __i++) {
    var __got, __err = null, __pass = false;
    try {
      var __fn = (typeof ${functionName} === "function")
        ? ${functionName}
        : (typeof globalThis !== "undefined" ? globalThis[${fnLiteral}] : undefined);
      if (typeof __fn !== "function") throw new Error("Không tìm thấy hàm " + ${fnLiteral});
      __got = __fn.apply(null, __cases[__i].args);
      __pass = __deepEqual(__got, __cases[__i].expected);
    } catch (e) { __err = String((e && e.message) || e); }
    __results.push({ i: __i, pass: __pass, got: __safe(__got), error: __err });
  }
  console.log(${JSON.stringify(RESULT_MARKER)} + JSON.stringify({ results: __results }));
})();
`;
}

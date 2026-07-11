import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // === Ranh giới kiến trúc (docs/09 §6) ===
  // helpers/ phải là hàm THUẦN — cấm import React/Next.
  {
    files: ["src/helpers/**/*.ts", "src/features/*/helpers/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react-dom", "next", "next/*"],
              message: "helpers/ phải là hàm THUẦN — không import React/Next.",
            },
          ],
        },
      ],
    },
  },
  // Import feature khác CHỈ qua barrel @/features/<name> (cấm thọc sâu).
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/*"],
              message: "Import feature khác chỉ qua barrel @/features/<name>.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "app/_archive/**",
    "coverage/**",
    "dist/**",
    "build/**",
    "out/**",
  ]),

  ...nextVitals,
  ...nextTs,
]);
import nextConfig from "eslint-config-next/core-web-vitals";
import markdown from "@eslint/markdown";

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
      "**/*.md",
    ],
  },
  ...nextConfig,
  {
    rules: {
      // eslint-plugin-react-hooks 7.1 made this an error; the CRUD pattern syncs props to state in effects by design.
      "react-hooks/set-state-in-effect": "warn",
      "no-console": ["warn", { allow: ["error", "warn"] }],
    },
  },
  {
    // Auth/session code: a stray log can leak tokens (see TASK109, 2026-10-28).
    files: ["proxy.ts", "supabase/*.ts", "lib/auth/**/*.ts"],
    rules: {
      "no-console": ["error", { allow: ["error", "warn"] }],
    },
  },
  {
    // CLI scripts and tests report through stdout by design.
    files: ["scripts/**", "e2e/**", "e2e-tests/**", "__tests__/**", "supabase/functions/**"],
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["**/*.md"],
    plugins: {
      markdown,
    },
    language: "markdown/commonmark",
    rules: {
      "markdown/no-html": "warn",
      "markdown/no-duplicate-headings": "error",
      "markdown/no-missing-label-refs": "error",
    },
  },
];

export default eslintConfig;

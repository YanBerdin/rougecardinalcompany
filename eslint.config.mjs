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

import nextConfig from "eslint-config-next/core-web-vitals";
import markdown from "@eslint/markdown";

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "**/*.md",
    ],
  },
  ...nextConfig,
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

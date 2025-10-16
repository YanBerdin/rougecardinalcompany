import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import markdown from "@eslint/markdown";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "node_modules/**", 
      ".next/**", 
      "out/**", 
      "build/**", 
      "next-env.d.ts",
      // Ignore Markdown files from main ESLint config to avoid React plugin conflicts
      "**/*.md"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // Separate Markdown linting configuration
  {
    files: ["**/*.md"],
    plugins: {
      markdown
    },
    language: "markdown/commonmark",
    rules: {
      "markdown/no-html": "warn",
      "markdown/no-duplicate-headings": "error",
      "markdown/no-missing-label-refs": "error"
    }
  }
];

export default eslintConfig;

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Désactiver les règles problématiques
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unnecessary-type-constraint": "off",
      "@next/next/no-img-element": "off",
      "jsx-a11y/alt-text": "off",

      // Ou vous pouvez les mettre en warning au lieu de error
      // "@typescript-eslint/no-unused-vars": "warn",
      // "react/no-unescaped-entities": "warn",
    },
  },
  {
    // Ignorer certains fichiers spécifiques
    ignores: ["lib/generated/**/*", "*.js", "node_modules/**/*"],
  },
];

export default eslintConfig;

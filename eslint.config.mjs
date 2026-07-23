import unusedImports from "eslint-plugin-unused-imports";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import typescriptEslintParser from "@typescript-eslint/parser";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "hooks/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
      "@typescript-eslint": typescriptEslintPlugin
    },
    rules: {
      // 1. Limpieza y Ordenamiento de Imports (Auto-fixable)
      "unused-imports/no-unused-imports": "error",
      "simple-import-sort/imports": [
        "error",
        {
          "groups": [
            ["^react", "^next", "^@?\\w"],
            ["^@/"],
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"]
          ]
        }
      ],
      "simple-import-sort/exports": "error",

      // 2. Consistencia Profesional en Imports de Tipo (Auto-fixable)
      // Asegura que las interfaces o tipos siempre se importen con 'import type'
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          "prefer": "type-imports",
          "fixStyle": "separate-type-imports",
          "disallowTypeAnnotations": false
        }
      ],

      // 3. Buenas Prácticas de Tipado
      // Desalienta el uso de 'any' explícito, promoviendo tipos seguros (unknown, etc.)
      "@typescript-eslint/no-explicit-any": "warn",

      // 4. Convenciones de Nombre (Naming Conventions)
      // Lanza advertencias si alguien rompe las convenciones corporativas
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          // Clases, Interfaces y Types deben ser PascalCase
          "selector": "typeLike",
          "format": ["PascalCase"]
        },
        {
          // Los valores de un ENUM deben ser CONSTANT_CASE
          "selector": "enumMember",
          "format": ["UPPER_CASE"]
        },
        {
          // Variables que guarden true/false deben llevar un prefijo indicativo
          "selector": "variable",
          "types": ["boolean"],
          "format": ["PascalCase"],
          "prefix": ["is", "should", "has", "can", "did", "will"]
        }
      ]
    }
  }
];

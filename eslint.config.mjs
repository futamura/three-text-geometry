// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import tsParser from "@typescript-eslint/parser";
import jsdoc from 'eslint-plugin-jsdoc';
import "eslint-plugin-only-warn";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  {
    extends: [
      eslint.configs.recommended,                          // Use recommended ESLint settings
      ...tseslint.configs.recommended,                     // Spread recommended settings
      eslintConfigPrettier,                                // Integrate Prettier with ESLint
      jsdoc.configs['flat/recommended'],                   // Integrate JSDoc with ESLint
    ],
    languageOptions: {
      parser: tsParser,                                    // TypeScript parser for ESLint
      parserOptions: {
        project: "tsconfig.json",                          // Path to the TypeScript configuration file
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "tsconfig.json",                        // Path to the TypeScript configuration for import resolution
        },
      },
    },
    plugins: {
      "jsdoc": jsdoc,                                      // JSDoc plugin for linting JSDoc comments
    },
    rules: {
      "no-unused-vars": "off",                             // Disable the rule for unused variables
      "no-this-alias": "off",                              // Disable the rule for aliasing 'this'
      "no-case-declarations": "off",                       // Disable the rule for case declarations
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "varsIgnorePattern": "^_",
          "argsIgnorePattern": "^_",
        },
      ],                                                   // Disable TypeScript rule for unused variables
      "@typescript-eslint/no-non-null-assertion": "off",   // Disable TypeScript rule for non-null assertions
      "@typescript-eslint/no-this-alias": "off",           // Disable TypeScript rule for aliasing 'this'
      "@typescript-eslint/no-explicit-any": "off",         // Disable TypeScript rule for using 'any' type
      "@typescript-eslint/no-unsafe-call": "off",          // Disable TypeScript rule for unsafe calls
      // 'jsdoc/require-description': 'warn',
      // 'jsdoc/require-returns': 'warn',
      // 'jsdoc/require-returns-type': 'warn',
      // 'jsdoc/require-param': 'warn',
      // 'jsdoc/require-param-type': 'warn',
      // 'jsdoc/require-returns-description': 'warn',
      // 'jsdoc/require-param-description': 'warn',
      // 'jsdoc/require-returns-check': 'warn',
      "jsdoc/reject-any-type": "off",
      "jsdoc/no-undefined-types": "off",
      "jsdoc/no-defaults": "off",
      "jsdoc/check-tag-names": "off",
      "jsdoc/require-param": [
        "error",
          {
            "checkDestructuredRoots": false,
          },
      ],
      "jsdoc/tag-lines": [
        "error",
        "never",
        {
          "startLines": 1
        }
      ],
      "jsdoc/require-jsdoc": [
        "error",
          {
            "publicOnly": true,
            "require": {
              "ArrowFunctionExpression": true,
              "ClassDeclaration": true,
              "ClassExpression": true,
              "FunctionDeclaration": true,
              "FunctionExpression": true,
              "MethodDefinition": true,
            },
            "contexts": [
              "VariableDeclaration",
              "TSInterfaceDeclaration",
              "TSTypeAliasDeclaration",
              "TSPropertySignature",
              "TSMethodSignature",
            ],
          },
      ],
    },
    files: [
      'src/**/*.{ts,tsx}',
      'tests/**/*.{ts,tsx}',
    ],
    ignores: [
      ".yalc",
      ".vscode",
      ".github",
      "node_modules",
      "dist-cjs",
      "dist-esm",
      "tests",
      "jest.config.ts",
      "scripts",
      "coverage",
      "demo",
    ]
  }
);
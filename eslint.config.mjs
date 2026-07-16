import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import tsEslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
    {
        ignores: [
            "node_modules/**",
            "vendor/**",
            ".astro/**",
            "dist/**",
            "_site/**",
            "public/**",
            "assets/build/**",
            "mig/baselines/**",
            "mig/fixtures/visual/**",
        ],
    },
    ...tsEslint.config(
        eslint.configs.recommended,
        tsEslint.configs.recommended,
        tsEslint.configs.stylistic
    ),
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json",
            },
        },
        plugins: {
            "@stylistic": stylistic,
        },
        rules: {
            "no-undef": "off",
            "lines-between-class-members": ["off"],
            "@stylistic/lines-between-class-members": ["off"],
            "@stylistic/indent": ["error", 4],
            "@stylistic/comma-dangle": ["error", {
                arrays: "always-multiline",
                objects: "always-multiline",
                imports: "always-multiline",
                exports: "always-multiline",
                enums: "always-multiline",
                functions: "never",
            }],
            quotes: "off",
            "@stylistic/quotes": ["error", "double"],
            "max-classes-per-file": ["off"],
            "no-param-reassign": ["off"],
            "max-len": ["off"],
            "no-underscore-dangle": ["off"],
            "no-plusplus": ["off"],
            "no-restricted-syntax": ["off"],
            "use-isnan": "error",
            "valid-typeof": "off",
            "space-in-parens": "off",
            "arrow-parens": ["error", "as-needed"],
            "no-continue": "off",
            "no-bitwise": "off",
            "@typescript-eslint/dot-notation": "off",
            "no-multiple-empty-lines": ["error", { max: 2, maxEOF: 1 }],
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            }],
            "@typescript-eslint/lines-between-class-members": "off",
            "no-use-before-define": "off",
            "dot-notation": "off",
        },
    },
    {
        files: ["**/*.mjs", "eslint.config.mjs"],
        languageOptions: {
            globals: globals.node,
        },
    },
    {
        files: ["src/client/**/*.{ts,tsx}"],
        languageOptions: {
            globals: globals.browser,
        },
    },
    {
        files: ["scripts/test/eval-visual.mjs"],
        languageOptions: {
            globals: globals.browser,
        },
    },
    {
        files: ["src/env.d.ts"],
        rules: {
            "@typescript-eslint/triple-slash-reference": "off",
        },
    },
];

import eslint from "@eslint/js";
import stylisticJs from "@stylistic/eslint-plugin-js";
import stylisticTs from "@stylistic/eslint-plugin-ts";
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
            "@stylistic/js": stylisticJs,
            "@stylistic/ts": stylisticTs,
        },
        rules: {
            "no-undef": "off",
            "import/no-unresolved": "off",
            "lines-between-class-members": ["off"],
            "@stylistic/ts/lines-between-class-members": ["off"],
            "@stylistic/ts/indent": ["error", 4],
            "@stylistic/ts/comma-dangle": ["error", {
                arrays: "always-multiline",
                objects: "always-multiline",
                imports: "always-multiline",
                exports: "always-multiline",
                enums: "always-multiline",
                functions: "never",
            }],
            quotes: "off",
            "@stylistic/ts/quotes": ["error", "double"],
            "import/extensions": ["off"],
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
        files: ["ts/**/*.{ts,tsx}"],
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

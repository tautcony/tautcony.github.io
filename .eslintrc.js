module.exports = {
    "root": true,
    "env": {
        "browser": true,
        "es6": true,
        "node": false
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "airbnb-base", "airbnb-typescript/base"],
    "plugins": [
        "@typescript-eslint", "import"
    ],
    "ignorePatterns": [
        ".eslintrc.js",
        "build",
        "js",
    ],
    "rules": {
        "@typescript-eslint/indent": ["error", 4],
        "@typescript-eslint/lines-between-class-members": ["off"],
        "@typescript-eslint/quotes": ["error", "double"],
        "@typescript-eslint/comma-dangle": ["error", {
            "arrays": "always-multiline",
            "objects": "always-multiline",
            "imports": "always-multiline",
            "exports": "always-multiline",
            "enums": "always-multiline",
            "functions": "never"
        }],
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
        "no-multiple-empty-lines": ["error", {"max": 2, "maxEOF": 1}],
    }
};

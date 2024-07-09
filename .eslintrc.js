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
    "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "airbnb-base"],
    "plugins": [
        "@typescript-eslint", "import"
    ],
    "ignorePatterns": [
        ".eslintrc.js",
        "build",
        "js",
    ],
    "rules": {
      "no-undef": "off",
      "import/no-unresolved": "off",
      "lines-between-class-members": ["off"],
      "@typescript-eslint/lines-between-class-members": ["off"],
      "indent": "off",
      "@typescript-eslint/indent": ["error", 4],
      "comma-dangle": "off",
      "@typescript-eslint/comma-dangle": ["error", {
          "arrays": "always-multiline",
          "objects": "always-multiline",
          "imports": "always-multiline",
          "exports": "always-multiline",
          "enums": "always-multiline",
          "functions": "never"
      }],
      "quotes": "off",
      "@typescript-eslint/quotes": ["error", "double"],
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
      "no-multiple-empty-lines": ["error", {"max": 2, "maxEOF": 1}],
      "no-unused-vars": "off",
      "@typescript-eslint/lines-between-class-members": "off",
      "no-use-before-define": "off",
      "dot-notation": "off",
    },
};

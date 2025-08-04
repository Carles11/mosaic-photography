module.exports = {
  extends: [
    "next/core-web-vitals",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
  plugins: ["import"],
  rules: {
    // Import order rules
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling"],
          "index",
          "object",
          "type",
        ],
        pathGroups: [
          {
            pattern: "react",
            group: "external",
            position: "before",
          },
          {
            pattern: "next/**",
            group: "external",
            position: "before",
          },
          {
            pattern: "@/lib/**",
            group: "internal",
            position: "before",
          },
          {
            pattern: "@/components/**",
            group: "internal",
            position: "after",
          },
          {
            pattern: "./*.module.css",
            group: "index",
            position: "after",
          },
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "import/no-duplicates": "error",

    // Fix unescaped entities issues
    "react/no-unescaped-entities": [
      "error",
      {
        forbid: [
          {
            char: ">",
            alternatives: ["&gt;"],
          },
          {
            char: "}",
            alternatives: ["&#125;"],
          },
        ],
      },
    ],

    // Handle TypeScript rules
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    "@typescript-eslint/no-explicit-any": "error",

    // React hooks
    "react-hooks/exhaustive-deps": "warn",

    // Next.js specific rules
    "@next/next/no-img-element": "warn",
    "@next/next/no-html-link-for-pages": "error",
    "@next/next/no-css-tags": "warn",
  },
};

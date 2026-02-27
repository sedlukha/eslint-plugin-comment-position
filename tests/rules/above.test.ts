import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { above } from "../../src/rules/above.js";

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022 },
});

describe("above rule", () => {
  it("passes valid cases and catches invalid ones", () => {
    tester.run("above", above, {
      valid: [
        // Comment already above code
        { code: "// comment\nconst x = 1;" },
        // Comment below code (not a violation for 'above' rule)
        { code: "const x = 1;\n// comment below" },
        // eslint-disable inline is ignored by default
        { code: "const x = 1; // eslint-disable-line no-unused-vars" },
        // eslint-disable-next-line is ignored
        { code: "const x = 1; // eslint-disable-next-line" },
        // ignorePattern match
        {
          code: "const x = 1; // TODO: fix this",
          options: [{ ignorePattern: "^\\s*TODO" }],
        },
        // Multi-line block comment (skipped in v1)
        { code: "/* multi\nline */ const x = 1;" },
        // Comment on its own line with nothing after
        { code: "// standalone" },
        // Block comment on its own line
        { code: "/* block */\nconst x = 1;" },
      ],
      invalid: [
        // Basic inline line comment
        {
          code: "const x = 1; // inline",
          errors: [{ messageId: "above" }],
          output: "// inline\nconst x = 1;",
        },
        // Indented inline line comment
        {
          code: "  const x = 1; // indented",
          errors: [{ messageId: "above" }],
          output: "  // indented\n  const x = 1;",
        },
        // Inline comment inside function
        {
          code: "function foo() {\n  return 42; // answer\n}",
          errors: [{ messageId: "above" }],
          output: "function foo() {\n  // answer\n  return 42;\n}",
        },
        // Block comment before code
        {
          code: "/* block before */ const x = 1;",
          errors: [{ messageId: "blockAbove" }],
          output: "/* block before */\nconst x = 1;",
        },
        // Indented block comment before code
        {
          code: "  /* block before */ const x = 1;",
          errors: [{ messageId: "blockAbove" }],
          output: "  /* block before */\n  const x = 1;",
        },
        // applyDefaultIgnorePatterns: false — eslint-disable should become a violation
        {
          code: "const x = 1; // eslint-disable-line no-unused-vars",
          options: [{ applyDefaultIgnorePatterns: false }],
          errors: [{ messageId: "above" }],
          output: "// eslint-disable-line no-unused-vars\nconst x = 1;",
        },
      ],
    });
  });
});

import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { commentPosition } from "../../src/rules/comment-position.js";

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022 },
});

describe("comment-position rule", () => {
  describe("position: above", () => {
    it("passes valid cases and catches invalid ones", () => {
      tester.run("comment-position", commentPosition, {
        valid: [
          // Comment already above code
          { code: "// comment\nconst x = 1;", options: [{ position: "above" }] },
          // Comment below code (not a violation for 'above' position)
          { code: "const x = 1;\n// comment below", options: [{ position: "above" }] },
          // eslint-disable inline is ignored by default
          { code: "const x = 1; // eslint-disable-line no-unused-vars", options: [{ position: "above" }] },
          // eslint-disable-next-line is ignored
          { code: "const x = 1; // eslint-disable-next-line", options: [{ position: "above" }] },
          // ignorePattern match
          {
            code: "const x = 1; // TODO: fix this",
            options: [{ position: "above", ignorePattern: "^\\s*TODO" }],
          },
          // Multi-line block comment (skipped in v1)
          { code: "/* multi\nline */ const x = 1;", options: [{ position: "above" }] },
          // Comment on its own line with nothing after
          { code: "// standalone", options: [{ position: "above" }] },
          // Block comment on its own line
          { code: "/* block */\nconst x = 1;", options: [{ position: "above" }] },
        ],
        invalid: [
          // Basic inline line comment
          {
            code: "const x = 1; // inline",
            options: [{ position: "above" }],
            errors: [{ messageId: "above" }],
            output: "// inline\nconst x = 1;",
          },
          // Indented inline line comment
          {
            code: "  const x = 1; // indented",
            options: [{ position: "above" }],
            errors: [{ messageId: "above" }],
            output: "  // indented\n  const x = 1;",
          },
          // Inline comment inside function
          {
            code: "function foo() {\n  return 42; // answer\n}",
            options: [{ position: "above" }],
            errors: [{ messageId: "above" }],
            output: "function foo() {\n  // answer\n  return 42;\n}",
          },
          // Block comment before code
          {
            code: "/* block before */ const x = 1;",
            options: [{ position: "above" }],
            errors: [{ messageId: "blockAbove" }],
            output: "/* block before */\nconst x = 1;",
          },
          // Indented block comment before code
          {
            code: "  /* block before */ const x = 1;",
            options: [{ position: "above" }],
            errors: [{ messageId: "blockAbove" }],
            output: "  /* block before */\n  const x = 1;",
          },
          // applyDefaultIgnorePatterns: false — eslint-disable should become a violation
          {
            code: "const x = 1; // eslint-disable-line no-unused-vars",
            options: [{ position: "above", applyDefaultIgnorePatterns: false }],
            errors: [{ messageId: "above" }],
            output: "// eslint-disable-line no-unused-vars\nconst x = 1;",
          },
        ],
      });
    });
  });

  describe("position: beside", () => {
    it("passes valid cases and catches invalid ones", () => {
      tester.run("comment-position", commentPosition, {
        valid: [
          // Comment already after code (inline)
          { code: "const x = 1; // inline", options: [{ position: "beside" }] },
          // Standalone comment with no code after (no violation)
          { code: "// standalone\n", options: [{ position: "beside" }] },
          // Standalone comment at end of file
          { code: "// standalone", options: [{ position: "beside" }] },
          // Comment with blank line before code (not immediately above)
          { code: "// comment\n\nconst x = 1;", options: [{ position: "beside" }] },
          // eslint-disable above code is ignored by default
          { code: "// eslint-disable-next-line no-unused-vars\nconst x = 1;", options: [{ position: "beside" }] },
          // ignorePattern match
          {
            code: "// TODO: fix this\nconst x = 1;",
            options: [{ position: "beside", ignorePattern: "^\\s*TODO" }],
          },
          // Block comment already after code
          { code: "const x = 1; /* inline block */", options: [{ position: "beside" }] },
          // Multi-line block comment (skipped in v1)
          { code: "/* multi\nline */ const x = 1;", options: [{ position: "beside" }] },
          // Block comment on its own line with nothing on same line after
          { code: "/* block */\nconst x = 1;", options: [{ position: "beside" }] },
        ],
        invalid: [
          // Basic standalone line comment above code
          {
            code: "// standalone\nconst x = 1;",
            options: [{ position: "beside" }],
            errors: [{ messageId: "beside" }],
            output: "const x = 1; // standalone",
          },
          // Indented standalone line comment above indented code
          {
            code: "  // standalone\n  const x = 1;",
            options: [{ position: "beside" }],
            errors: [{ messageId: "beside" }],
            output: "  const x = 1; // standalone",
          },
          // Block comment before code on same line
          {
            code: "/* before */ const x = 1;",
            options: [{ position: "beside" }],
            errors: [{ messageId: "blockBeside" }],
            output: "const x = 1; /* before */",
          },
          // Indented block comment before code
          {
            code: "  /* before */ const x = 1;",
            options: [{ position: "beside" }],
            errors: [{ messageId: "blockBeside" }],
            output: "  const x = 1; /* before */",
          },
          // applyDefaultIgnorePatterns: false — eslint-disable-next-line above code becomes violation
          {
            code: "// eslint-disable-next-line no-unused-vars\nconst x = 1;",
            options: [{ position: "beside", applyDefaultIgnorePatterns: false }],
            errors: [{ messageId: "beside" }],
            output: "const x = 1; // eslint-disable-next-line no-unused-vars",
          },
        ],
      });
    });
  });
});

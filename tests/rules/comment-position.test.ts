import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { commentPosition } from "../../src/rules/comment-position.js";

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022 },
});

const jsxTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

describe("comment-position rule", () => {
  describe("position: above", () => {
    it("passes valid cases and catches invalid ones", () => {
      tester.run("position", commentPosition, {
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
          // Block comment at end of file with no code after (tokenAfter = null)
          { code: "const x = 1;\n/* trailing */", options: [{ position: "above" }] },
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

  describe("JSX support", () => {
    it("ignores JSX expression comments for both positions", () => {
      jsxTester.run("position", commentPosition, {
        valid: [
          // Inline JSX comment inside element (position: above)
          {
            code: "const el = <div>{/* comment */}</div>;",
            options: [{ position: "above" }],
          },
          // JSX comment on its own line above a child (position: above)
          {
            code: "const el = <div>\n  {/* comment */}\n  <span />\n</div>;",
            options: [{ position: "above" }],
          },
          // Multi-line commented-out JSX (position: above)
          {
            code: "const el = <div>\n  {/* <span> */}\n  {/*   content */}\n  {/* </span> */}\n</div>;",
            options: [{ position: "above" }],
          },
          // Inline JSX comment inside element (position: beside)
          {
            code: "const el = <div>{/* comment */}</div>;",
            options: [{ position: "beside" }],
          },
          // JSX comment on its own line above a child (position: beside)
          {
            code: "const el = <div>\n  {/* comment */}\n  <span />\n</div>;",
            options: [{ position: "beside" }],
          },
        ],
        invalid: [],
      });
    });
  });

  describe("position: beside", () => {
    it("passes valid cases and catches invalid ones", () => {
      tester.run("position", commentPosition, {
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
          // Trailing newline in source — covers codeLineEnd !== -1 branch
          {
            code: "// standalone\nconst x = 1;\n",
            options: [{ position: "beside" }],
            errors: [{ messageId: "beside" }],
            output: "const x = 1; // standalone\n",
          },
          // Block comment before code, trailing newline — covers codeLineEnd !== -1 branch in block fixer
          {
            code: "/* before */ const x = 1;\n",
            options: [{ position: "beside" }],
            errors: [{ messageId: "blockBeside" }],
            output: "const x = 1; /* before */\n",
          },
        ],
      });
    });
  });
});

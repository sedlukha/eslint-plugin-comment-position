import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { beside } from "../../src/rules/beside.js";

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022 },
});

describe("beside rule", () => {
  it("passes valid cases and catches invalid ones", () => {
    tester.run("beside", beside, {
      valid: [
        // Comment already after code (inline)
        { code: "const x = 1; // inline" },
        // Standalone comment with no code after (no violation)
        { code: "// standalone\n" },
        // Standalone comment at end of file
        { code: "// standalone" },
        // Comment with blank line before code (not immediately above)
        { code: "// comment\n\nconst x = 1;" },
        // eslint-disable above code is ignored by default
        { code: "// eslint-disable-next-line no-unused-vars\nconst x = 1;" },
        // ignorePattern match
        {
          code: "// TODO: fix this\nconst x = 1;",
          options: [{ ignorePattern: "^\\s*TODO" }],
        },
        // Block comment already after code
        { code: "const x = 1; /* inline block */" },
        // Multi-line block comment (skipped in v1)
        { code: "/* multi\nline */ const x = 1;" },
        // Block comment on its own line with nothing on same line after
        { code: "/* block */\nconst x = 1;" },
      ],
      invalid: [
        // Basic standalone line comment above code
        {
          code: "// standalone\nconst x = 1;",
          errors: [{ messageId: "beside" }],
          output: "const x = 1; // standalone",
        },
        // Indented standalone line comment above indented code
        {
          code: "  // standalone\n  const x = 1;",
          errors: [{ messageId: "beside" }],
          output: "  const x = 1; // standalone",
        },
        // Block comment before code on same line
        {
          code: "/* before */ const x = 1;",
          errors: [{ messageId: "blockBeside" }],
          output: "const x = 1; /* before */",
        },
        // Indented block comment before code
        {
          code: "  /* before */ const x = 1;",
          errors: [{ messageId: "blockBeside" }],
          output: "  const x = 1; /* before */",
        },
        // applyDefaultIgnorePatterns: false — eslint-disable-next-line above code becomes violation
        {
          code: "// eslint-disable-next-line no-unused-vars\nconst x = 1;",
          options: [{ applyDefaultIgnorePatterns: false }],
          errors: [{ messageId: "beside" }],
          output: "const x = 1; // eslint-disable-next-line no-unused-vars",
        },
      ],
    });
  });
});

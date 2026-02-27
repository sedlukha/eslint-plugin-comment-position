import type { Rule } from "eslint";
import { shouldIgnore, sharedSchema, type CommentPositionOptions } from "./utils.js";

export const above: Rule.RuleModule = {
  meta: {
    type: "layout",
    fixable: "code",
    schema: sharedSchema,
    messages: {
      above: "Line comment should be above the code, not inline.",
      blockAbove: "Block comment should be on its own line above the code.",
    },
  },
  create(context) {
    const options = (context.options[0] ?? {}) as CommentPositionOptions;
    const sourceCode = context.sourceCode;

    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          if (shouldIgnore(comment.value, options)) continue;

          if (comment.type === "Line") {
            // Violation: line comment inline after code
            const tokenBefore = sourceCode.getTokenBefore(comment as any, { includeComments: false });
            if (!tokenBefore) continue;
            if (tokenBefore.loc!.end.line !== comment.loc!.start.line) continue;

            context.report({
              loc: comment.loc!,
              messageId: "above",
              fix(fixer) {
                const src = sourceCode.getText();
                const start = comment.range![0];
                const end = comment.range![1];
                // Eat spaces before //
                let removeStart = start;
                while (removeStart > 0 && src[removeStart - 1] === " ") removeStart--;
                // Get line start for insertion
                const lineStart = src.lastIndexOf("\n", start - 1) + 1;
                const indent = src.slice(lineStart, start).match(/^(\s*)/)?.[1] ?? "";
                return [
                  fixer.removeRange([removeStart, end]),
                  fixer.replaceTextRange([lineStart, lineStart], `${indent}//${comment.value}\n`),
                ];
              },
            });

          } else if (comment.type === "Block") {
            // Only handle single-line block comments (v1 scope)
            if (comment.loc!.start.line !== comment.loc!.end.line) continue;

            // Violation: block comment before code on same line
            const tokenAfter = sourceCode.getTokenAfter(comment as any, { includeComments: false });
            if (!tokenAfter) continue;
            if (tokenAfter.loc!.start.line !== comment.loc!.end.line) continue;

            context.report({
              loc: comment.loc!,
              messageId: "blockAbove",
              fix(fixer) {
                const src = sourceCode.getText();
                const commentStart = comment.range![0];
                const commentEnd = comment.range![1];
                // Eat spaces after block comment
                let spaceEnd = commentEnd;
                while (spaceEnd < src.length && src[spaceEnd] === " ") spaceEnd++;
                // Indentation of the current line
                const lineStart = src.lastIndexOf("\n", commentStart - 1) + 1;
                const indent = src.slice(lineStart, commentStart).match(/^(\s*)/)?.[1] ?? "";
                // Replace "/* comment */ " with "/* comment */\n<indent>"
                return fixer.replaceTextRange(
                  [commentStart, spaceEnd],
                  `/*${comment.value}*/\n${indent}`,
                );
              },
            });
          }
        }
      },
    };
  },
};

//#region src/rules/utils.ts
const DEFAULT_IGNORE = /^\s*(?:eslint(?:-disable(?:-next)?-line|-enable|-disable)?|jshint\s+|jslint\s+|istanbul\s+|globals?\s+|exported\s+|jscs|falls?\s?through)/u;
const sharedSchema = [{
	type: "object",
	properties: {
		ignorePattern: { type: "string" },
		applyDefaultIgnorePatterns: { type: "boolean" }
	},
	additionalProperties: false
}];
function shouldIgnore(value, options) {
	if ((options.applyDefaultIgnorePatterns ?? true) && DEFAULT_IGNORE.test(value)) return true;
	if (options.ignorePattern && new RegExp(options.ignorePattern, "u").test(value)) return true;
	return false;
}

//#endregion
//#region src/rules/above.ts
const above = {
	meta: {
		type: "layout",
		fixable: "code",
		schema: sharedSchema,
		messages: {
			above: "Line comment should be above the code, not inline.",
			blockAbove: "Block comment should be on its own line above the code."
		}
	},
	create(context) {
		const options = context.options[0] ?? {};
		const sourceCode = context.sourceCode;
		return { Program() {
			for (const comment of sourceCode.getAllComments()) {
				if (shouldIgnore(comment.value, options)) continue;
				if (comment.type === "Line") {
					const tokenBefore = sourceCode.getTokenBefore(comment, { includeComments: false });
					if (!tokenBefore) continue;
					if (tokenBefore.loc.end.line !== comment.loc.start.line) continue;
					context.report({
						loc: comment.loc,
						messageId: "above",
						fix(fixer) {
							const src = sourceCode.getText();
							const start = comment.range[0];
							const end = comment.range[1];
							let removeStart = start;
							while (removeStart > 0 && src[removeStart - 1] === " ") removeStart--;
							const lineStart = src.lastIndexOf("\n", start - 1) + 1;
							const indent = src.slice(lineStart, start).match(/^(\s*)/)?.[1] ?? "";
							return [fixer.removeRange([removeStart, end]), fixer.replaceTextRange([lineStart, lineStart], `${indent}//${comment.value}\n`)];
						}
					});
				} else if (comment.type === "Block") {
					if (comment.loc.start.line !== comment.loc.end.line) continue;
					const tokenAfter = sourceCode.getTokenAfter(comment, { includeComments: false });
					if (!tokenAfter) continue;
					if (tokenAfter.loc.start.line !== comment.loc.end.line) continue;
					context.report({
						loc: comment.loc,
						messageId: "blockAbove",
						fix(fixer) {
							const src = sourceCode.getText();
							const commentStart = comment.range[0];
							let spaceEnd = comment.range[1];
							while (spaceEnd < src.length && src[spaceEnd] === " ") spaceEnd++;
							const lineStart = src.lastIndexOf("\n", commentStart - 1) + 1;
							const indent = src.slice(lineStart, commentStart).match(/^(\s*)/)?.[1] ?? "";
							return fixer.replaceTextRange([commentStart, spaceEnd], `/*${comment.value}*/\n${indent}`);
						}
					});
				}
			}
		} };
	}
};

//#endregion
//#region src/rules/beside.ts
const beside = {
	meta: {
		type: "layout",
		fixable: "code",
		schema: sharedSchema,
		messages: {
			beside: "Line comment should be beside the code (at end of line), not above it.",
			blockBeside: "Block comment should appear after the code, not before it."
		}
	},
	create(context) {
		const options = context.options[0] ?? {};
		const sourceCode = context.sourceCode;
		return { Program() {
			for (const comment of sourceCode.getAllComments()) {
				if (shouldIgnore(comment.value, options)) continue;
				if (comment.type === "Line") {
					const tokenBefore = sourceCode.getTokenBefore(comment, { includeComments: false });
					if (!(!tokenBefore || tokenBefore.loc.end.line !== comment.loc.start.line)) continue;
					const tokenAfter = sourceCode.getTokenAfter(comment, { includeComments: false });
					if (!tokenAfter) continue;
					if (tokenAfter.loc.start.line !== comment.loc.start.line + 1) continue;
					context.report({
						loc: comment.loc,
						messageId: "beside",
						fix(fixer) {
							const src = sourceCode.getText();
							const commentStart = comment.range[0];
							const commentEnd = comment.range[1];
							const lineStart = src.lastIndexOf("\n", commentStart - 1) + 1;
							let removalEnd = commentEnd;
							if (src[removalEnd] === "\n") removalEnd++;
							let codeLineEnd = src.indexOf("\n", tokenAfter.range[0]);
							if (codeLineEnd === -1) codeLineEnd = src.length;
							removalEnd - lineStart;
							return [fixer.removeRange([lineStart, removalEnd]), fixer.replaceTextRange([codeLineEnd, codeLineEnd], ` //${comment.value}`)];
						}
					});
				} else if (comment.type === "Block") {
					if (comment.loc.start.line !== comment.loc.end.line) continue;
					const tokenAfter = sourceCode.getTokenAfter(comment, { includeComments: false });
					if (!tokenAfter) continue;
					if (tokenAfter.loc.start.line !== comment.loc.end.line) continue;
					context.report({
						loc: comment.loc,
						messageId: "blockBeside",
						fix(fixer) {
							const src = sourceCode.getText();
							const commentStart = comment.range[0];
							const commentEnd = comment.range[1];
							const lineStart = src.lastIndexOf("\n", commentStart - 1) + 1;
							const indent = src.slice(lineStart, commentStart);
							let spaceEnd = commentEnd;
							while (spaceEnd < src.length && src[spaceEnd] === " ") spaceEnd++;
							let codeLineEnd = src.indexOf("\n", spaceEnd);
							if (codeLineEnd === -1) codeLineEnd = src.length;
							const codeText = src.slice(spaceEnd, codeLineEnd);
							return fixer.replaceTextRange([lineStart, codeLineEnd], `${indent}${codeText} /*${comment.value}*/`);
						}
					});
				}
			}
		} };
	}
};

//#endregion
//#region src/index.ts
const plugin = {
	meta: {
		name: "eslint-plugin-comment-position",
		version: "0.1.0"
	},
	rules: {
		above,
		beside
	},
	configs: {}
};
Object.assign(plugin.configs, {
	recommended: [{
		plugins: { "comment-position": plugin },
		rules: { "comment-position/above": "error" }
	}],
	"recommended-beside": [{
		plugins: { "comment-position": plugin },
		rules: { "comment-position/beside": "error" }
	}]
});

//#endregion
export { plugin as default };
//# sourceMappingURL=index.mjs.map
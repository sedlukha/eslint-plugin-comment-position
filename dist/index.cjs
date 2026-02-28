
//#region src/rules/utils.ts
const DEFAULT_IGNORE = /^\s*(?:eslint(?:-disable(?:-next)?-line|-enable|-disable)?|jshint\s+|jslint\s+|istanbul\s+|globals?\s+|exported\s+|jscs|falls?\s?through)/u;
const sharedSchema = [{
	type: "object",
	properties: {
		position: {
			type: "string",
			enum: ["above", "beside"]
		},
		ignorePattern: { type: "string" },
		applyDefaultIgnorePatterns: { type: "boolean" }
	},
	required: ["position"],
	additionalProperties: false
}];
function shouldIgnore(value, options) {
	if ((options.applyDefaultIgnorePatterns ?? true) && DEFAULT_IGNORE.test(value)) return true;
	if (options.ignorePattern && new RegExp(options.ignorePattern, "u").test(value)) return true;
	return false;
}

//#endregion
//#region src/rules/comment-position.ts
function isJSXComment(comment, src) {
	if (comment.type !== "Block") return false;
	const [start, end] = comment.range;
	return start > 0 && src[start - 1] === "{" && end < src.length && src[end] === "}";
}
const commentPosition = {
	meta: {
		type: "layout",
		fixable: "code",
		schema: sharedSchema,
		messages: {
			above: "Line comment should be above the code, not inline.",
			blockAbove: "Block comment should be on its own line above the code.",
			beside: "Line comment should be beside the code (at end of line), not above it.",
			blockBeside: "Block comment should appear after the code, not before it."
		}
	},
	create(context) {
		const options = context.options[0] ?? {};
		const sourceCode = context.sourceCode;
		return { Program() {
			const src = sourceCode.getText();
			for (const comment of sourceCode.getAllComments()) {
				if (shouldIgnore(comment.value, options)) continue;
				if (isJSXComment(comment, src)) continue;
				if (options.position === "above") {
					if (comment.type === "Line") {
						const tokenBefore = sourceCode.getTokenBefore(comment, { includeComments: false });
						if (!tokenBefore) continue;
						if (tokenBefore.loc.end.line !== comment.loc.start.line) continue;
						context.report({
							loc: comment.loc,
							messageId: "above",
							fix(fixer) {
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
								const commentStart = comment.range[0];
								let spaceEnd = comment.range[1];
								while (spaceEnd < src.length && src[spaceEnd] === " ") spaceEnd++;
								const lineStart = src.lastIndexOf("\n", commentStart - 1) + 1;
								const indent = src.slice(lineStart, commentStart).match(/^(\s*)/)?.[1] ?? "";
								return fixer.replaceTextRange([commentStart, spaceEnd], `/*${comment.value}*/\n${indent}`);
							}
						});
					}
				} else if (options.position === "beside") {
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
								const commentStart = comment.range[0];
								const commentEnd = comment.range[1];
								const lineStart = src.lastIndexOf("\n", commentStart - 1) + 1;
								let removalEnd = commentEnd;
								if (src[removalEnd] === "\n") removalEnd++;
								let codeLineEnd = src.indexOf("\n", tokenAfter.range[0]);
								if (codeLineEnd === -1) codeLineEnd = src.length;
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
	rules: { "position": commentPosition },
	configs: {}
};
Object.assign(plugin.configs, {
	recommended: [{
		plugins: { "comment-position": plugin },
		rules: { "comment-position/position": ["error", { position: "above" }] }
	}],
	"recommended-beside": [{
		plugins: { "comment-position": plugin },
		rules: { "comment-position/position": ["error", { position: "beside" }] }
	}]
});

//#endregion
module.exports = plugin;
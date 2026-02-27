import type { Rule } from "eslint";

export interface CommentPositionOptions {
  ignorePattern?: string;
  applyDefaultIgnorePatterns?: boolean;
}

export const DEFAULT_IGNORE =
  /^\s*(?:eslint(?:-disable(?:-next)?-line|-enable|-disable)?|jshint\s+|jslint\s+|istanbul\s+|globals?\s+|exported\s+|jscs|falls?\s?through)/u;

export const sharedSchema = [{
  type: "object" as const,
  properties: {
    ignorePattern: { type: "string" },
    applyDefaultIgnorePatterns: { type: "boolean" },
  },
  additionalProperties: false,
}];

export function shouldIgnore(value: string, options: CommentPositionOptions): boolean {
  const applyDefaults = options.applyDefaultIgnorePatterns ?? true;
  if (applyDefaults && DEFAULT_IGNORE.test(value)) return true;
  if (options.ignorePattern && new RegExp(options.ignorePattern, "u").test(value)) return true;
  return false;
}

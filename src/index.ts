import { above } from "./rules/above.js";
import { beside } from "./rules/beside.js";
import type { Linter } from "eslint";

const plugin = {
  meta: { name: "eslint-plugin-comment-position", version: "0.1.0" },
  rules: { above, beside },
  configs: {} as Record<string, Linter.Config[]>,
};

Object.assign(plugin.configs, {
  recommended: [{ plugins: { "comment-position": plugin }, rules: { "comment-position/above": "error" } }],
  "recommended-beside": [{ plugins: { "comment-position": plugin }, rules: { "comment-position/beside": "error" } }],
});

export default plugin;

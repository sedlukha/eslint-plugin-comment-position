import { commentPosition } from "./rules/comment-position.js";
import type { Linter } from "eslint";

const plugin = {
  meta: { name: "eslint-plugin-comment-position", version: "0.1.0" },
  rules: { "comment-position": commentPosition },
  configs: {} as Record<string, Linter.Config[]>,
};

Object.assign(plugin.configs, {
  recommended: [
    {
      plugins: { "comment-position": plugin },
      rules: { "comment-position/comment-position": ["error", { position: "above" }] },
    },
  ],
  "recommended-beside": [
    {
      plugins: { "comment-position": plugin },
      rules: { "comment-position/comment-position": ["error", { position: "beside" }] },
    },
  ],
});

export default plugin;

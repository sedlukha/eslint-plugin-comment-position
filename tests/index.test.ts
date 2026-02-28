import { describe, it, expect } from "vitest";
import plugin from "../src/index.js";

describe("plugin export", () => {
  it("exports a valid ESLint plugin", () => {
    expect(plugin.meta.name).toBe("eslint-plugin-comment-position");
    expect(plugin.rules["position"]).toBeDefined();
    expect(plugin.configs["recommended"]).toBeDefined();
    expect(plugin.configs["recommended-beside"]).toBeDefined();
  });
});

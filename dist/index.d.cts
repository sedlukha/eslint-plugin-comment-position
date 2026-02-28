import * as eslint from "eslint";
import { Linter } from "eslint";

//#region src/index.d.ts
declare const plugin: {
  meta: {
    name: string;
    version: string;
  };
  rules: {
    position: eslint.Rule.RuleModule;
  };
  configs: Record<string, Linter.Config[]>;
};
export = plugin;
//# sourceMappingURL=index.d.cts.map
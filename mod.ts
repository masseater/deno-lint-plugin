/**
 * no-underscore-dangle
 *
 * Denoリントプラグインで、識別子の先頭または末尾のアンダースコア（_）を禁止するルール。
 * ESLintの同名ルールと同様の機能を提供します。
 */

import { NoUnderscoreDangleRule } from "./rules/no_underscore_dangle.ts";

/**
 * no-underscore-dangleプラグイン
 */
const plugin: Deno.lint.Plugin = {
    name: "deno-lint-plugin",
    rules: {
        "no-underscore-dangle": NoUnderscoreDangleRule,
    },
} as const;

export default plugin;

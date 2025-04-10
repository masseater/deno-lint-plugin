/**
 * no-underscore-dangle
 *
 * A Deno lint plugin that disallows dangling underscores in identifiers,
 * similar to ESLint's no-underscore-dangle rule.
 */

import { noUnderscoreDanglePlugin } from "./plugin.ts";

export default noUnderscoreDanglePlugin;

// Re-export plugin configuration types
export type { NoUnderscoreDangleOptions } from "./plugin.ts";

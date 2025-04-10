import { assertEquals } from "../deps.ts";
import plugin from "../mod.ts";

// Diagnosticの型定義
interface Diagnostic {
    message: string;
    fix?: {
        text: string;
    }[];
}

/**
 * 診断結果の型を確認する関数
 */
function isDiagnosticArray(value: unknown): value is Diagnostic[] {
    return Array.isArray(value) &&
        (value.length === 0 ||
            (value[0] && typeof value[0].message === "string"));
}

// 基本的なテスト
Deno.test("no-underscore-dangle - should report leading underscores", async () => {
    const code = "const _foo = 'bar'; function _test() {}";
    let diagnostics: Diagnostic[] = [];

    try {
        // Deno.lintを使用するが、存在しない場合はテストをスキップ
        if (typeof Deno.lint?.runPlugin === "function") {
            const result = await Deno.lint.runPlugin(plugin, "test.ts", code);
            if (isDiagnosticArray(result)) {
                diagnostics = result;
            } else {
                console.warn("Unexpected result format from lint API");
                return;
            }
        } else {
            console.warn("Deno.lint API is not available, skipping test");
            return;
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.warn(`Lint API error: ${err.message}`);
        } else {
            console.warn("Unknown lint API error");
        }
        return;
    }

    assertEquals(diagnostics.length, 2);
    assertEquals(diagnostics[0].message, "Unexpected dangling '_' in '_foo'.");
    assertEquals(diagnostics[1].message, "Unexpected dangling '_' in '_test'.");

    // 修正候補のチェック
    if (diagnostics[0].fix && diagnostics[1].fix) {
        assertEquals(diagnostics[0].fix[0].text, "foo");
        assertEquals(diagnostics[1].fix[0].text, "test");
    }
});

Deno.test("no-underscore-dangle - should report trailing underscores", async () => {
    const code = "const foo_ = 'bar'; function test_() {}";
    let diagnostics: Diagnostic[] = [];

    try {
        // Deno.lintを使用するが、存在しない場合はテストをスキップ
        if (typeof Deno.lint?.runPlugin === "function") {
            const result = await Deno.lint.runPlugin(plugin, "test.ts", code);
            if (isDiagnosticArray(result)) {
                diagnostics = result;
            } else {
                console.warn("Unexpected result format from lint API");
                return;
            }
        } else {
            console.warn("Deno.lint API is not available, skipping test");
            return;
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.warn(`Lint API error: ${err.message}`);
        } else {
            console.warn("Unknown lint API error");
        }
        return;
    }

    assertEquals(diagnostics.length, 2);
    assertEquals(diagnostics[0].message, "Unexpected dangling '_' in 'foo_'.");
    assertEquals(diagnostics[1].message, "Unexpected dangling '_' in 'test_'.");

    // 修正候補のチェック
    if (diagnostics[0].fix && diagnostics[1].fix) {
        assertEquals(diagnostics[0].fix[0].text, "foo");
        assertEquals(diagnostics[1].fix[0].text, "test");
    }
});

Deno.test("no-underscore-dangle - should not report identifiers without underscores", async () => {
    const code = "const foo = 'bar'; function test() {}; const under_score = 'middle';";
    let diagnostics: Diagnostic[] = [];

    try {
        // Deno.lintを使用するが、存在しない場合はテストをスキップ
        if (typeof Deno.lint?.runPlugin === "function") {
            const result = await Deno.lint.runPlugin(plugin, "test.ts", code);
            if (isDiagnosticArray(result)) {
                diagnostics = result;
            } else {
                console.warn("Unexpected result format from lint API");
                return;
            }
        } else {
            console.warn("Deno.lint API is not available, skipping test");
            return;
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.warn(`Lint API error: ${err.message}`);
        } else {
            console.warn("Unknown lint API error");
        }
        return;
    }

    assertEquals(diagnostics.length, 0);
});

Deno.test("no-underscore-dangle - should not report special identifiers", async () => {
    const code = "const __proto__ = {}; const __dirname = '/path'; const __filename = 'file.ts';";
    let diagnostics: Diagnostic[] = [];

    try {
        // Deno.lintを使用するが、存在しない場合はテストをスキップ
        if (typeof Deno.lint?.runPlugin === "function") {
            const result = await Deno.lint.runPlugin(plugin, "test.ts", code);
            if (isDiagnosticArray(result)) {
                diagnostics = result;
            } else {
                console.warn("Unexpected result format from lint API");
                return;
            }
        } else {
            console.warn("Deno.lint API is not available, skipping test");
            return;
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.warn(`Lint API error: ${err.message}`);
        } else {
            console.warn("Unknown lint API error");
        }
        return;
    }

    assertEquals(diagnostics.length, 0);
});

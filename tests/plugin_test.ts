import { assertEquals } from "../deps.ts";
import plugin from "../mod.ts";

// 基本的なテスト
Deno.test("no-underscore-dangle - should report leading underscores", () => {
    const diagnostics = Deno.lint.runPlugin(
        plugin,
        "test.ts",
        "const _foo = 'bar'; function _test() {}",
    );

    assertEquals(diagnostics.length, 2);
    assertEquals(diagnostics[0].message, "Unexpected dangling '_' in '_foo'.");
    assertEquals(diagnostics[1].message, "Unexpected dangling '_' in '_test'.");

    // 修正候補のチェック
    if (diagnostics[0].fix && diagnostics[1].fix) {
        assertEquals(diagnostics[0].fix[0].text, "foo");
        assertEquals(diagnostics[1].fix[0].text, "test");
    }
});

Deno.test("no-underscore-dangle - should report trailing underscores", () => {
    const diagnostics = Deno.lint.runPlugin(
        plugin,
        "test.ts",
        "const foo_ = 'bar'; function test_() {}",
    );

    assertEquals(diagnostics.length, 2);
    assertEquals(diagnostics[0].message, "Unexpected dangling '_' in 'foo_'.");
    assertEquals(diagnostics[1].message, "Unexpected dangling '_' in 'test_'.");

    // 修正候補のチェック
    if (diagnostics[0].fix && diagnostics[1].fix) {
        assertEquals(diagnostics[0].fix[0].text, "foo");
        assertEquals(diagnostics[1].fix[0].text, "test");
    }
});

Deno.test("no-underscore-dangle - should not report identifiers without underscores", () => {
    const diagnostics = Deno.lint.runPlugin(
        plugin,
        "test.ts",
        "const foo = 'bar'; function test() {}; const under_score = 'middle';",
    );

    assertEquals(diagnostics.length, 0);
});

Deno.test("no-underscore-dangle - should not report special identifiers", () => {
    const diagnostics = Deno.lint.runPlugin(
        plugin,
        "test.ts",
        "const __proto__ = {}; const __dirname = '/path'; const __filename = 'file.ts';",
    );

    assertEquals(diagnostics.length, 0);
});

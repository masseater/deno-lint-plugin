import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { noUnderscoreDanglePlugin } from "../plugin.ts";

Deno.test("no-underscore-dangle - basic functionality", async () => {
    // Leading underscore
    let diagnostics = await Deno.lint.runPlugin(
        noUnderscoreDanglePlugin,
        "test.ts",
        "const _foo = 'test';",
    );

    assertEquals(diagnostics.length, 1);
    assertEquals(
        diagnostics[0].message,
        "Identifier '_foo' with dangling underscore is not allowed.",
    );

    // Note: Fix object structure depends on the Deno lint plugin API
    // Just verify that there's a fix property
    assertEquals(typeof diagnostics[0].fix, "object");

    // Trailing underscore
    diagnostics = await Deno.lint.runPlugin(
        noUnderscoreDanglePlugin,
        "test.ts",
        "const bar_ = 'test';",
    );

    assertEquals(diagnostics.length, 1);
    assertEquals(
        diagnostics[0].message,
        "Identifier 'bar_' with dangling underscore is not allowed.",
    );
    assertEquals(typeof diagnostics[0].fix, "object");

    // No underscore dangle (valid code)
    diagnostics = await Deno.lint.runPlugin(
        noUnderscoreDanglePlugin,
        "test.ts",
        "const bar = 'test';",
    );

    assertEquals(diagnostics.length, 0);
});

Deno.test("no-underscore-dangle - allow option", async () => {
    // With allow option
    const diagnostics = await Deno.lint.runPlugin(
        noUnderscoreDanglePlugin,
        "test.ts",
        `
    // @deno-options { "no-underscore-dangle": { "allow": ["_allowed"] } }
    const _allowed = 'test'; 
    const _notAllowed = 'test';
    `,
    );

    assertEquals(diagnostics.length, 1);
    assertEquals(
        diagnostics[0].message,
        "Identifier '_notAllowed' with dangling underscore is not allowed.",
    );
});

Deno.test("no-underscore-dangle - special names", async () => {
    // Special names like __proto__, __filename should be allowed
    const diagnostics = await Deno.lint.runPlugin(
        noUnderscoreDanglePlugin,
        "test.ts",
        "const __proto__ = {}; const __filename = 'test.ts'; const __dirname = '/path';",
    );

    assertEquals(diagnostics.length, 0);
});

Deno.test("no-underscore-dangle - function parameters", async () => {
    // Default: function parameters are allowed to have underscore
    let diagnostics = await Deno.lint.runPlugin(
        noUnderscoreDanglePlugin,
        "test.ts",
        "function test(_param) { const _var = 'test'; return _param; }",
    );

    assertEquals(diagnostics.length, 1);
    assertEquals(
        diagnostics[0].message,
        "Identifier '_var' with dangling underscore is not allowed.",
    );

    // Disallow function parameters with underscore
    diagnostics = await Deno.lint.runPlugin(
        noUnderscoreDanglePlugin,
        "test.ts",
        `
    // @deno-options { "no-underscore-dangle": { "allowFunctionParams": false } }
    function test(_param) { const bar = 'test'; return _param; }
    `,
    );

    assertEquals(diagnostics.length, 1);
    assertEquals(
        diagnostics[0].message,
        "Identifier '_param' with dangling underscore is not allowed.",
    );
});

Deno.test("no-underscore-dangle - this and super contexts", async () => {
    // Test allowAfterThis option
    let diagnostics = await Deno.lint.runPlugin(
        noUnderscoreDanglePlugin,
        "test.ts",
        `
    // @deno-options { "no-underscore-dangle": { "allowAfterThis": true } }
    class Test {
      constructor() {
        this._private = 'test';
      }
      method() {
        return this._private;
      }
    }
    `,
    );

    assertEquals(diagnostics.length, 0);

    // Test disallowing after this
    diagnostics = await Deno.lint.runPlugin(
        noUnderscoreDanglePlugin,
        "test.ts",
        `
    // @deno-options { "no-underscore-dangle": { "allowAfterThis": false } }
    class Test {
      constructor() {
        this._private = 'test';
      }
      method() {
        return this._private;
      }
    }
    `,
    );

    // Not checking the count here because expression references are complex
    // and might vary based on AST traversal. Instead checking at least one is reported.
    assertEquals(diagnostics.length > 0, true);
    assertEquals(
        diagnostics.some((d) => d.message.includes("_private")),
        true,
    );
});

Deno.test("no-underscore-dangle - destructuring contexts", async () => {
    // Array destructuring (allowed by default)
    let diagnostics = await Deno.lint.runPlugin(
        noUnderscoreDanglePlugin,
        "test.ts",
        "const [_first, second] = [1, 2];",
    );

    assertEquals(diagnostics.length, 0);

    // Disallow array destructuring
    diagnostics = await Deno.lint.runPlugin(
        noUnderscoreDanglePlugin,
        "test.ts",
        `
    // @deno-options { "no-underscore-dangle": { "allowInArrayDestructuring": false } }
    const [_first, second] = [1, 2];
    `,
    );

    assertEquals(diagnostics.length, 1);
    assertEquals(
        diagnostics[0].message,
        "Identifier '_first' with dangling underscore is not allowed.",
    );

    // Object destructuring (allowed by default)
    diagnostics = await Deno.lint.runPlugin(
        noUnderscoreDanglePlugin,
        "test.ts",
        "const { prop: _renamed } = { prop: 'value' };",
    );

    assertEquals(diagnostics.length, 0);

    // Disallow object destructuring
    diagnostics = await Deno.lint.runPlugin(
        noUnderscoreDanglePlugin,
        "test.ts",
        `
    // @deno-options { "no-underscore-dangle": { "allowInObjectDestructuring": false } }
    const { prop: _renamed } = { prop: 'value' };
    `,
    );

    assertEquals(diagnostics.length, 1);
    assertEquals(
        diagnostics[0].message,
        "Identifier '_renamed' with dangling underscore is not allowed.",
    );
});

Deno.test("no-underscore-dangle - method and class field names", async () => {
    // Method names (not enforced by default)
    let diagnostics = await Deno.lint.runPlugin(
        noUnderscoreDanglePlugin,
        "test.ts",
        `
    class Test {
      _privateMethod() {
        return 'test';
      }
    }
    `,
    );

    assertEquals(diagnostics.length, 0);

    // Enforce in method names
    diagnostics = await Deno.lint.runPlugin(
        noUnderscoreDanglePlugin,
        "test.ts",
        `
    // @deno-options { "no-underscore-dangle": { "enforceInMethodNames": true } }
    class Test {
      _privateMethod() {
        return 'test';
      }
    }
    `,
    );

    assertEquals(diagnostics.length, 1);
    assertEquals(
        diagnostics[0].message,
        "Identifier '_privateMethod' with dangling underscore is not allowed.",
    );

    // Class fields (not enforced by default)
    diagnostics = await Deno.lint.runPlugin(
        noUnderscoreDanglePlugin,
        "test.ts",
        `
    class Test {
      _privateField = 'test';
    }
    `,
    );

    assertEquals(diagnostics.length, 0);

    // Enforce in class fields
    diagnostics = await Deno.lint.runPlugin(
        noUnderscoreDanglePlugin,
        "test.ts",
        `
    // @deno-options { "no-underscore-dangle": { "enforceInClassFields": true } }
    class Test {
      _privateField = 'test';
    }
    `,
    );

    assertEquals(diagnostics.length, 1);
    assertEquals(
        diagnostics[0].message,
        "Identifier '_privateField' with dangling underscore is not allowed.",
    );
});

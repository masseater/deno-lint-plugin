# no-underscore-dangle

Deno リントプラグインで、識別子の先頭または末尾のアンダースコア（`_`）を禁止するルールです。

このプラグインは ESLint
の[no-underscore-dangle](https://eslint.org/docs/rules/no-underscore-dangle)ルールを模倣しています。

## インストール

```json
// deno.json
{
    "lint": {
        "plugins": ["https://deno.land/x/masseater_no_underscore_dangle/mod.ts"],
        "rules": {
            "tags": ["recommended"],
            "include": ["no-underscore-dangle/no-underscore-dangle"]
        }
    }
}
```

## 使用方法

このルールは以下の識別子を検出します：

```typescript
// Bad: 先頭のアンダースコア
const _foo = "bar";
function _doSomething() {}

// Bad: 末尾のアンダースコア
const foo_ = "bar";
function doSomething_() {}

// Good: アンダースコアなし、または中間のアンダースコア
const foo = "bar";
const foo_bar = "baz";
```

## オプション

このプラグインは以下のオプションをサポートしています（将来的な実装予定）：

- `allow` - 許可する識別子のリスト
- `allowAfterThis` - `this`オブジェクトのメンバーのアンダースコアを許可
- `allowAfterSuper` - `super`オブジェクトのメンバーのアンダースコアを許可
- `allowAfterThisConstructor` - `this.constructor`オブジェクトのメンバーのアンダースコアを許可
- `enforceInMethodNames` - メソッド名でもルールを適用するかどうか
- `enforceInClassFields` - クラスフィールド名でもルールを適用するかどうか
- `allowInArrayDestructuring` - 配列分割代入でのアンダースコアを許可するかどうか
- `allowInObjectDestructuring` - オブジェクト分割代入でのアンダースコアを許可するかどうか
- `allowFunctionParams` - 関数パラメータでのアンダースコアを許可するかどうか

## 特別な識別子

以下の特別な識別子は常に許可されます：

- `__proto__`
- `__dirname`
- `__filename`

## 開発

```bash
# テストの実行
deno test -A
```

## ライセンス

MIT

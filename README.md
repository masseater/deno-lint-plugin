# deno-lint-plugins

## no-underscore-dangle

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

## コードの品質管理

### TSR による未使用コードの検出

未使用のコードを検出・削除するために [TSR (TypeScript Remove)](https://github.com/line/tsr)
を使用することをお勧めします。TSR は未使用の export やモジュールを見つけて削除するツールです。

```bash
# TSRをインストール
npm install -g tsr

# 未使用コードの検出
tsr --project tsconfig.json 'mod\.ts$'

# 未使用コードの自動削除
tsr --write --recursive --project tsconfig.json 'mod\.ts$'
```

TSR は TypeScript プロジェクトのツリーシェイキングのように機能し、未使用の export
や変数を検出します。CI パイプラインで使用することで、未使用コードの蓄積を防ぐことができます。

## ライセンス

MIT

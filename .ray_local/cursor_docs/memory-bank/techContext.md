# Technical Context: Deno No Underscore Dangle

## Technology Stack

### Core Technologies

- **Deno**: JavaScript および TypeScript のランタイム環境
- **TypeScript**: 型安全なコードのための言語
- **ESTree**: JavaScript コードの抽象構文木（AST）の標準

### Development Tools

- **Deno CLI**: テスト、リント、フォーマットなどの開発ツール
- **deno_hooks**: Git フックの管理
- **VS Code**: 主要な開発環境

## Development Setup

### 環境要件

- Deno v1.x 以上
- Git（フック機能を使用する場合）

### プロジェクト構成

```
deno-no-underscore-dangle/
├── .hooks/               # Gitフック設定
├── .ray_local/           # Cursor用のドキュメント
├── .vscode/              # VS Code設定
├── tests/                # テストファイル
├── deno.json             # Deno設定
├── mod.ts                # モジュールエントリポイント
├── plugin.ts             # プラグイン実装
└── utils.ts              # ユーティリティ関数
```

### 主要なタスク

- `deno task test`: テストの実行
- `deno task lint`: リントの実行
- `deno task fmt`: フォーマットの実行
- `deno task type-check`: 型チェックの実行
- `deno task check:all`: すべてのチェックを実行
- `deno task hook:install`: Git フックのインストール
- `deno task hook:add`: Git フックの追加

## Technical Constraints

### Deno Lint API

Deno の lint プラグインは、以下のインターフェースに準拠する必要があります：

```typescript
{
  name: string;
  vendor: { name: string; version: string };
  rules: {
    [ruleName: string]: {
      create(context: LintContext): Visitor;
      meta: {
        docs: { description: string; url?: string };
        schema: JSONSchema[];
      };
    }
  };
}
```

### AST Visitor Pattern

AST ノードを走査するための Visitor パターン：

```typescript
type Visitor = {
    [NodeType: string]: (node: ASTNode) => void;
};
```

### Context Limitations

現在、`context.getParent()` に関する問題があります。この関数は Deno の lint
コンテキストオブジェクトで正しく実装されていない可能性があります。

## Integration Points

### Deno Lint System

プラグインは、Deno の lint システムによって読み込まれ、設定されたファイルに対して実行されます。

### Git Hooks

`deno_hooks`を使用して Git フックと統合されています：

- pre-commit フック: コミット前にリント、フォーマット、テストを実行

### Editor Integration

VS Code などのエディタと統合して、リアルタイムのフィードバックを提供します。

## Performance Considerations

### AST Traversal

- 大規模なファイルでは、AST の走査が重くなる可能性があります
- 不要なノードの処理を避けるために、ターゲットノードタイプを明示的に指定

### Rule Options

- オプション処理は各ノード処理の一部として行われるため、パフォーマンスに影響する可能性があります
- 可能な限り早期にスキップ条件をチェックして不要な処理を回避

## Security Considerations

- コード修正の提案は、セキュリティに影響を与える可能性があるため注意が必要
- 自動修正は最小限の変更に留め、コードの意図を変えないように注意

## Compatibility

### Deno Version

- 最新の Deno バージョン（1.x）で動作確認
- lint プラグイン API の変更に注意が必要

### TypeScript Version

- TypeScript の最新構文と互換性あり
- 新しい TypeScript 機能（プライベートフィールドなど）も考慮

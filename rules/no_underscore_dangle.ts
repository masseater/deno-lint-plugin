/**
 * no-underscore-dangle ルール
 *
 * 識別子の先頭または末尾のアンダースコア（_）を禁止するルール。
 */

// オプションのインタフェース定義
interface NoUnderscoreDangleOptions {
    // 許可する識別子のリスト
    allow?: readonly string[];
    // thisの後のアンダースコアを許可するか（例：this._foo）
    allowAfterThis?: boolean;
    // superの後のアンダースコアを許可するか（例：super._foo）
    allowAfterSuper?: boolean;
    // thisのコンストラクタ後のアンダースコアを許可するか
    allowAfterThisConstructor?: boolean;
    // メソッド名のアンダースコアをチェックするか
    enforceInMethodNames?: boolean;
    // クラスフィールド名のアンダースコアをチェックするか
    enforceInClassFields?: boolean;
    // 配列の分割代入でのアンダースコアを許可するか
    allowInArrayDestructuring?: boolean;
    // オブジェクトの分割代入でのアンダースコアを許可するか
    allowInObjectDestructuring?: boolean;
    // 関数パラメータのアンダースコアを許可するか
    allowFunctionParams?: boolean;
}

// デフォルトオプション
const DEFAULT_OPTIONS = {
    allow: ["_id", "__dirname", "__filename", "__proto__"],
    allowAfterThis: false,
    allowAfterSuper: false,
    allowAfterThisConstructor: false,
    enforceInMethodNames: true,
    enforceInClassFields: true,
    allowInArrayDestructuring: false,
    allowInObjectDestructuring: false,
    allowFunctionParams: false,
} as const;

// 特別に許可される識別子のセット
const ALLOWED_IDENTIFIERS = new Set<string>(["__proto__", "__dirname", "__filename"]);

/**
 * no-underscore-dangle ルール
 */
export const NoUnderscoreDangleRule: Deno.lint.Rule = {
    create(context) {
        // ユーザー設定のオプションとデフォルトオプションをマージ
        const options: NoUnderscoreDangleOptions = {
            ...DEFAULT_OPTIONS,
            // Deno.lint.Ruleはコンテキストから直接オプションにアクセスする方法を提供していない
            // ので、ユーザーカスタムオプションは実装時に渡す必要がある
        };

        /**
         * 識別子の先頭または末尾にアンダースコアがあるかチェック
         */
        function hasDanglingUnderscore(name: string): boolean {
            return name.startsWith("_") || name.endsWith("_");
        }

        /**
         * 許可されている識別子かどうかチェック
         */
        function isAllowed(name: string): boolean {
            return (
                // 特別な識別子リストに含まれる
                ALLOWED_IDENTIFIERS.has(name) ||
                // allowリストに含まれる
                (Array.isArray(options.allow) && options.allow.includes(name))
            );
        }

        return {
            Identifier(node) {
                const name = node.name;

                // アンダースコアがない場合はスキップ
                if (!hasDanglingUnderscore(name)) {
                    return;
                }

                // 許可されている識別子はスキップ
                if (isAllowed(name)) {
                    return;
                }

                // エラー報告
                context.report({
                    node,
                    message: `Unexpected dangling '_' in '${name}'.`,
                    fix(fixer) {
                        const fixed = name
                            .replace(/^_/, "") // 先頭のアンダースコアを削除
                            .replace(/_$/, ""); // 末尾のアンダースコアを削除
                        return fixer.replaceText(node, fixed);
                    },
                });
            },
        };
    },
};

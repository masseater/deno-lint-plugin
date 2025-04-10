/**
 * no-underscore-dangle plugin implementation
 * A Deno lint plugin that disallows dangling underscores in identifiers.
 */

import { isIdentifierWithDanglingUnderscore, isSpecialName } from "./utils.ts";

/**
 * Options for the no-underscore-dangle rule
 */
export interface NoUnderscoreDangleOptions {
  /** Allows specified identifiers to have dangling underscores */
  allow?: string[];
  /** Allows dangling underscores in members of the this object */
  allowAfterThis?: boolean;
  /** Allows dangling underscores in members of the super object */
  allowAfterSuper?: boolean;
  /** Allows dangling underscores in members of the this.constructor object */
  allowAfterThisConstructor?: boolean;
  /** Enforces rule in method names */
  enforceInMethodNames?: boolean;
  /** Enforces rule in class field names */
  enforceInClassFields?: boolean;
  /** Allows dangling underscores in variable names assigned by array destructuring */
  allowInArrayDestructuring?: boolean;
  /** Allows dangling underscores in variable names assigned by object destructuring */
  allowInObjectDestructuring?: boolean;
  /** Allows dangling underscores in function parameter names */
  allowFunctionParams?: boolean;
}

/** Default options for no-underscore-dangle */
const DEFAULT_OPTIONS: NoUnderscoreDangleOptions = {
  allowAfterThis: false,
  allowAfterSuper: false,
  allowAfterThisConstructor: false,
  enforceInMethodNames: false,
  enforceInClassFields: false,
  allowInArrayDestructuring: true,
  allowInObjectDestructuring: true,
  allowFunctionParams: true,
};

// Type definitions for AST nodes
interface IdentifierNode {
  type: "Identifier";
  name: string;
  range: [number, number];
}

/**
 * Plugin implementation for no-underscore-dangle rule
 */
export const noUnderscoreDanglePlugin = {
  name: "no-underscore-dangle",
  vendor: {
    name: "deno-no-underscore-dangle",
    version: "0.1.0",
  },
  rules: {
    "no-underscore-dangle": {
      create(context: any) {
        return {
          Identifier(node: any) {
            handleIdentifier(node, context, DEFAULT_OPTIONS);
          },

          PropertyDefinition(node: any) {
            // Handle class fields if enforceInClassFields is enabled
            const options = { ...DEFAULT_OPTIONS, ...context.options };
            if (
              options.enforceInClassFields &&
              node.key.type === "Identifier"
            ) {
              handleIdentifier(node.key, context, options);
            }
          },

          MethodDefinition(node: any) {
            // Handle method names if enforceInMethodNames is enabled
            const options = { ...DEFAULT_OPTIONS, ...context.options };
            if (
              options.enforceInMethodNames &&
              node.key.type === "Identifier"
            ) {
              handleIdentifier(node.key, context, options);
            }
          },

          Property(node: any) {
            // Handle object property names
            const options = { ...DEFAULT_OPTIONS, ...context.options };
            if (node.key.type === "Identifier" && node.method) {
              if (options.enforceInMethodNames) {
                handleIdentifier(node.key, context, options);
              }
            }
          },
        };
      },

      meta: {
        docs: {
          description: "Disallow dangling underscores in identifiers",
          url: "https://github.com/yourusername/deno-no-underscore-dangle",
        },
        schema: [
          {
            type: "object",
            properties: {
              allow: { type: "array", items: { type: "string" } },
              allowAfterThis: { type: "boolean" },
              allowAfterSuper: { type: "boolean" },
              allowAfterThisConstructor: { type: "boolean" },
              enforceInMethodNames: { type: "boolean" },
              enforceInClassFields: { type: "boolean" },
              allowInArrayDestructuring: { type: "boolean" },
              allowInObjectDestructuring: { type: "boolean" },
              allowFunctionParams: { type: "boolean" },
            },
            additionalProperties: false,
          },
        ],
      },
    },
  },
};

/**
 * Handles identifiers and checks for dangling underscores
 */
function handleIdentifier(
  node: any,
  context: any,
  options: NoUnderscoreDangleOptions
): void {
  // Skip if parent indicates an allowed context
  if (shouldSkipBasedOnParent(node, context, options)) {
    return;
  }

  // Skip special names like __proto__, __filename, etc.
  if (isSpecialName(node.name)) {
    return;
  }

  // Check if identifier has a dangling underscore
  if (isIdentifierWithDanglingUnderscore(node.name)) {
    // Check if it's in the allowed list
    if (options.allow?.includes(node.name)) {
      return;
    }

    // Report the issue
    context.report({
      node,
      message: `Identifier '${node.name}' with dangling underscore is not allowed.`,
      fix: generateFix(node),
    });
  }
}

/**
 * Determines if the identifier should be skipped based on parent node context
 */
function shouldSkipBasedOnParent(
  node: any,
  context: any,
  options: NoUnderscoreDangleOptions
): boolean {
  const parent = context.getParent();

  if (!parent) return false;

  // Skip function parameters if allowFunctionParams is true
  if (
    options.allowFunctionParams &&
    (parent.type === "FunctionDeclaration" ||
      parent.type === "FunctionExpression" ||
      parent.type === "ArrowFunctionExpression")
  ) {
    // Check if the node is in the parameters
    if (
      parent.params?.some(
        (param: any) =>
          param === node ||
          (param.type === "AssignmentPattern" && param.left === node) ||
          (param.type === "RestElement" && param.argument === node)
      )
    ) {
      return true;
    }
  }

  // Skip variables in array/object destructuring if respective options are true
  if (parent.type === "ArrayPattern" && options.allowInArrayDestructuring) {
    return true;
  }

  if (parent.type === "ObjectPattern" && options.allowInObjectDestructuring) {
    return true;
  }

  // Check for this.property cases
  if (
    options.allowAfterThis &&
    parent.type === "MemberExpression" &&
    parent.object.type === "ThisExpression" &&
    parent.property === node
  ) {
    return true;
  }

  // Check for super.property cases
  if (
    options.allowAfterSuper &&
    parent.type === "MemberExpression" &&
    parent.object.type === "SuperExpression" &&
    parent.property === node
  ) {
    return true;
  }

  // Check for this.constructor.property cases
  if (
    options.allowAfterThisConstructor &&
    parent.type === "MemberExpression" &&
    parent.property === node
  ) {
    const grandParent = context.getAncestor(2);
    if (
      grandParent?.type === "MemberExpression" &&
      grandParent.object.type === "ThisExpression" &&
      grandParent.property.type === "Identifier" &&
      grandParent.property.name === "constructor"
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Generates a fix for the dangling underscore
 */
function generateFix(
  node: any
): { range: [number, number]; text: string } | undefined {
  const name = node.name;

  // If starts with underscore, remove it
  if (name.startsWith("_")) {
    const start = node.range?.[0] ?? node.start;
    return {
      range: [start, start + 1],
      text: "",
    };
  }

  // If ends with underscore, remove it
  if (name.endsWith("_")) {
    const end = node.range?.[1] ?? node.end;
    return {
      range: [end - 1, end],
      text: "",
    };
  }

  return undefined;
}

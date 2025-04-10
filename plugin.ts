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

// Type definitions for Deno's lint API
type LintContext = {
  options: Record<string, unknown>;
  getParent(): any;
  getAncestor(n: number): any;
  report(diagnostic: {
    id: string;
    message: string;
    range: [number, number];
    fix?: { range: [number, number]; text: string };
  }): void;
};

// Define node types
interface IdentifierNode {
  type: "Identifier";
  name: string;
  range: [number, number];
}

/**
 * Rule implementation for no-underscore-dangle
 */
const noUnderscoreDangleRule = {
  documentation: {
    description: "Disallow dangling underscores in identifiers",
    url: "https://github.com/yourusername/deno-no-underscore-dangle",
  },
  schema: {
    oneOf: [
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
  visit(node: any, context: LintContext) {
    const options: NoUnderscoreDangleOptions = {
      ...DEFAULT_OPTIONS,
      ...(context.options as NoUnderscoreDangleOptions),
    };

    // Handle different node types
    switch (node.type) {
      case "Identifier": {
        return handleIdentifier(node as IdentifierNode, context, options);
      }
      case "PropertyDefinition": {
        // Handle class fields if enforceInClassFields is enabled
        if (
          options.enforceInClassFields === true &&
          node.key.type === "Identifier"
        ) {
          return handleIdentifier(node.key as IdentifierNode, context, options);
        }
        break;
      }
      case "MethodDefinition": {
        // Handle method names if enforceInMethodNames is enabled
        if (
          options.enforceInMethodNames === true &&
          node.key.type === "Identifier"
        ) {
          return handleIdentifier(node.key as IdentifierNode, context, options);
        }
        break;
      }
      case "Property": {
        // Handle object property names
        if (node.key.type === "Identifier" && node.method) {
          if (options.enforceInMethodNames === true) {
            return handleIdentifier(
              node.key as IdentifierNode,
              context,
              options
            );
          }
        }
        break;
      }
    }
  },
};

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
    "no-underscore-dangle": noUnderscoreDangleRule,
  },
  onInitHandler() {
    // Optional cleanup code when the plugin is finished
  },
};

/**
 * Handles identifiers and checks for dangling underscores
 */
function handleIdentifier(
  node: IdentifierNode,
  context: LintContext,
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
      id: "no-underscore-dangle/no-underscore-dangle",
      message: `Identifier '${node.name}' with dangling underscore is not allowed.`,
      range: node.range,
      fix: generateFix(node),
    });
  }
}

/**
 * Determines if the identifier should be skipped based on parent node context
 */
function shouldSkipBasedOnParent(
  node: IdentifierNode,
  context: LintContext,
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
  node: IdentifierNode
): { range: [number, number]; text: string } | undefined {
  const name = node.name;

  // If starts with underscore, remove it
  if (name.startsWith("_")) {
    return {
      range: [node.range[0], node.range[0] + 1],
      text: "",
    };
  }

  // If ends with underscore, remove it
  if (name.endsWith("_")) {
    return {
      range: [node.range[1] - 1, node.range[1]],
      text: "",
    };
  }

  return undefined;
}

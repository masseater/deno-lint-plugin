/**
 * Utility functions for no-underscore-dangle plugin
 */

/**
 * Checks if an identifier has a dangling underscore
 * (starts or ends with an underscore).
 *
 * @param name The identifier name to check
 * @returns True if the identifier has a dangling underscore
 */
export function isIdentifierWithDanglingUnderscore(name: string): boolean {
    return name.startsWith("_") || name.endsWith("_");
}

/**
 * Checks if the identifier is a special name that should be allowed
 * regardless of underscore convention (e.g., __proto__, __filename)
 *
 * @param name The identifier name to check
 * @returns True if the identifier is a special name
 */
export function isSpecialName(name: string): boolean {
    const SPECIAL_NAMES = ["__proto__", "__dirname", "__filename"];

    return SPECIAL_NAMES.includes(name);
}

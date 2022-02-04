/**
 * Environment helper
 */
declare const IS_BROWSER: true | undefined;

/**
 * IS_BROWSER is set by rollup in browser build. In Node.js we have ReferenceError here
 */
export const IS_NODE = typeof IS_BROWSER === 'undefined';

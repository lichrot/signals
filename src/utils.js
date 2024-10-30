// Deno doesn't play nice with @import yet :'(
// /** @import { UrGet, Get, GetAll, Sub, Signal } from "./types.d.ts" */
/** @typedef {import("./types.d.ts").UrGet}   UrGet   */
/** @typedef {import("./types.d.ts").Get}     Get     */
/** @typedef {import("./types.d.ts").GetAll}  GetAll  */
/** @typedef {import("./types.d.ts").Sub}     Sub     */
/** @typedef {import("./types.d.ts").Signal}  Signal  */

/**
 * Decorates a given getter function with a helper method.
 * @arg {UrGet} getterFn
 * @returns {Get}
 */
const decorateGetterFn = (getterFn) => {
  /** @type {Get} */ (getterFn).all =
    /** @type {GetAll} */ ((signals) => signals.map(getterFn));
  return /** @type {Get} */ (getterFn);
};

/** Just gets signal's value */
export const defaultGetterFn = decorateGetterFn((signal) => signal.get());

/**
 * Subscribes given subscriber to primary signals up the chain.
 * @arg {Sub} sub
 * @arg {Signal} signal
 * @returns {void}
 */
const subscribe = (sub, signal) => {
  const primaries = signal.isPrimary ? [signal] : signal.primaries;

  for (const primary of primaries) {
    primary.subs.add(sub);
    sub.primaries.add(primary);
  }
};

/**
 * Creates a new getter function that also subscribes to primary signals up the chain.
 * @arg {Sub} sub
 * @returns {Get}
 */
export const createSubGetterFn = (sub) =>
  decorateGetterFn((signal) => {
    // Preemptively call get method in order to initialize lazy signals
    const value = signal.get();
    subscribe(sub, signal);
    return value;
  });

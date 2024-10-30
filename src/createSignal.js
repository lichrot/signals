// Deno doesn't play nice with @import yet :'(
// /** @import { ComparisonFn, Compute, Signal } from "./types.d.ts" */
/** @template [TValue=any]  @typedef {import("./types.d.ts").ComparisonFn<TValue>}  ComparisonFn  */
/** @template TValue        @typedef {import("./types.d.ts").Compute<TValue>}       Compute       */
/** @template [TValue=any]  @typedef {import("./types.d.ts").Signal<TValue>}        Signal        */
import { Comp } from "./Comp.js";
import { Primary } from "./Primary.js";

/**
 * Creates a subscriber signal that recomputes each time it's subscriptions have mutated. Recomputions are lazy (on demand).
 *
 * Although mutations are synchronous, subscriber signals recompute lazily (on demand),
 * and effects are scheduled to execute with [queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) by default.
 *
 * @example Create a computed signal
 * ```ts
 * const aSig = createSignal(10);
 * const bSig = createSignal(20);
 * const sumSig = createSignal((get) => get(aSig) + get(bSig));
 *
 * console.log(sumSig.get()); // prints "30"
 *
 * aSig.set(30);
 * bSig.set(40);
 *
 * console.log(sumSig.get()); // prints "70"
 * ```
 * @template TValue
 * @overload
 * @arg {Compute<TValue>} compute
 * @returns {Comp<TValue>}
 */
/**
 * Creates a primary signal that notifies it's subscribers about it's mutations.
 *
 * Although mutations are synchronous, subscriber signals recompute lazily (on demand),
 * and effects are scheduled to execute with [queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) by default.
 *
 * @example Create a computed signal
 * ```ts
 * const aSig = createSignal(10);
 * const bSig = createSignal(20);
 * const sumSig = createSignal((get) => get(aSig) + get(bSig));
 *
 * console.log(sumSig.get()); // prints "30"
 *
 * aSig.set(30);
 * bSig.set(40);
 *
 * console.log(sumSig.get()); // prints "70"
 * ```
 * @template TValue
 * @overload
 * @arg {TValue} value
 * @returns {Primary<TValue>}
 */
/**
 * Creates a primary signal that notifies it's subscribers about it's mutations.
 *
 * Although mutations are synchronous, subscriber signals recompute lazily (on demand),
 * and effects are scheduled to execute with [queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) by default.
 *
 * Individual primary signals can be set to use custom comparison function.
 * If custom comparison function is passed, then it will always be used instead of the default one.
 *
 * @example Create a computed signal
 * ```ts
 * const aSig = createSignal(10);
 * const bSig = createSignal(20);
 * const sumSig = createSignal((get) => get(aSig) + get(bSig));
 *
 * console.log(sumSig.get()); // prints "30"
 *
 * aSig.set(30);
 * bSig.set(40);
 *
 * console.log(sumSig.get()); // prints "70"
 * ```
 * @template TValue
 * @overload
 * @arg {TValue} value
 * @arg {ComparisonFn<TValue>} [customComparisonFn]
 * @returns {Primary<TValue>}
 */
/**
 * @template TValue
 * @arg {Compute<TValue> | TValue} computeOrValue
 * @arg {ComparisonFn<TValue>} [customComparisonFn]
 * @returns {Signal<TValue>}
 */
export function createSignal(computeOrValue, customComparisonFn) {
  if (typeof computeOrValue === "function") {
    return new Comp(/** @type {Compute<TValue>} */ (computeOrValue));
  }

  // type checking spazzes out here for some reason
  return /** @type {any} */ (new Primary(
    /** @type {any} */ (computeOrValue),
    /** @type {any} */ (customComparisonFn),
  ));
}

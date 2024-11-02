import { Comp } from "./Comp.ts";
import { Primary } from "./Primary.ts";
import type { ComparisonFn, Compute, Signal } from "./types.ts";

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
 * @param compute A function that is used to subscribe to other signals and derive its value
 * @returns A subscriber signal that recomputes each time it's subscriptions have mutated
 */
export function createSignal<TValue>(compute: Compute<TValue>): Comp<TValue>;
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
 * @param value Initial value to set this signal to
 * @returns A primary signal that notifies it's subscribers about it's mutations
 */
export function createSignal<TValue>(value: TValue): Primary<TValue>;
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
 * @param value Initial value to set this signal to
 * @param customComparisonFn Custom comparison function that will be used by this signal
 * @returns A primary signal that notifies it's subscribers about it's mutations
 */
export function createSignal<TValue>(
  value: TValue,
  customComparisonFn?: ComparisonFn<TValue>,
): Primary<TValue>;
/**
 * Creates a primary or computed signal based on the value passed.
 * @param computeOrValue A computation function or initial value
 * @param customComparisonFn Custom comparison function that will be used by this signal
 * @returns A primary or computed signal
 */
export function createSignal<TValue>(
  computeOrValue: Compute<TValue> | TValue,
  customComparisonFn?: ComparisonFn<TValue>,
): Signal<TValue> {
  if (typeof computeOrValue === "function") {
    return new Comp(computeOrValue as Compute<TValue>);
  }

  return new Primary(computeOrValue, customComparisonFn);
}

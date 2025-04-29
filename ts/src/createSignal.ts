import { Comp } from "./Comp.ts";
import { Primary } from "./Primary.ts";
import type { Compute, Signal } from "./types.ts";

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
 * const sumSig = createSignal((track) => track(aSig) + track(bSig));
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
export function createSignal<T>(compute: Compute<T>): Comp<T>;
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
 * const sumSig = createSignal((track) => track(aSig) + track(bSig));
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
export function createSignal<T>(value: T): Primary<T>;
/**
 * Creates a primary or computed signal based on the value passed.
 * @param computeOrValue A computation function or initial value
 * @returns A primary or computed signal
 */
export function createSignal<T>(computeOrValue: Compute<T> | T): Signal<T> {
  return typeof computeOrValue === "function"
    ? new Comp(computeOrValue as Compute<T>)
    : new Primary(computeOrValue as T);
}

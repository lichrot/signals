// Deno doesn't play nice with @import yet :'(
// /** @import { ComparisonFn, Sub, UrSignal } from "./types.d.ts" */
/** @template [TValue=any]  @typedef {import("./types.d.ts").ComparisonFn<TValue>}  ComparisonFn  */
/**                         @typedef {import("./types.d.ts").Sub}                   Sub           */
/** @template [TValue=any]  @typedef {import("./types.d.ts").UrSignal<TValue>}      UrSignal      */
import { IterableWeakSet } from "./IterableWeakSet.js";

/**
 * A primary signal that notifies it's subscribers about it's mutations.
 * @template [TValue=any]
 * @implements {UrSignal}
 */
export class Primary {
  /** This can be set to change the default comparison of values when mutating. @type {ComparisonFn} */
  static comparisonFnDefault = Object.is;
  /** Whether this entity is a primary signal. @readonly @type {true} */
  isPrimary = true;
  /** A set of all unique subscribers. @readonly @type {IterableWeakSet<Sub>} */
  subs = new IterableWeakSet();
  /** Function to use for comparison of values when mutating. @private @type {ComparisonFn<TValue>} */
  comparisonFn;
  /** The current value of this signal. @private @type {TValue} */
  value;

  /**
   * Creates a primary signal with a given initial value and possibly custom comparison function.
   * @overload
   * @arg {TValue} value
   */
  /**
   * Creates a primary signal with a given initial value and possibly custom comparison function.
   *
   * Individual primary signals can be set to use custom comparison function.
   * If custom comparison function is passed, then it will always be used instead of the default one.
   * @overload
   * @arg {TValue} value
   * @arg {ComparisonFn<TValue>} [comparisonFnCustom]
   */
  /**
   * @arg {TValue} value
   * @arg {ComparisonFn<TValue>} [comparisonFnCustom]
   */
  constructor(value, comparisonFnCustom) {
    this.value = value;
    this.comparisonFn = comparisonFnCustom ?? Primary.comparisonFnDefault;
  }

  /**
   * Returns the current of value of this signal.
   * @returns {TValue}
   */
  get() {
    return this.value;
  }

  /**
   * Mutates the current value of this signal.
   *
   * If the new value is the same (checked with default or custom comparison function),
   * then mutation and notification is aborted.
   * @arg {TValue} value
   * @returns {void}
   */
  set(value) {
    if (this.comparisonFn(this.value, value)) return;

    this.value = value;

    for (const sub of this.subs) {
      sub.notify();
    }
  }
}

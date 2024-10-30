// Deno doesn't play nice with @import yet :'(
// /** @import { Primary } from "./Primary.js" */
// /** @import { UrSignal, UrSub, Compute } from "./types.d.ts" */
/**                         @typedef {import("./Primary.js").Primary}           Primary   */
/** @template [TValue=any]  @typedef {import("./types.d.ts").UrSignal<TValue>}  UrSignal  */
/**                         @typedef {import("./types.d.ts").UrSub}             UrSub     */
/** @template TValue        @typedef {import("./types.d.ts").Compute<TValue>}   Compute   */
import { createSubGetterFn, defaultGetterFn } from "./utils.js";

/**
 * A subscriber signal that recomputes each time it's subscriptions have mutated. Recomputions are lazy (on demand).
 * @template [TValue=any]
 * @implements {UrSub}
 * @implements {UrSignal<TValue>}
 */
export class Comp {
  /** Whether this entity is a primary signal. @readonly @type {false} */
  isPrimary = false;
  /** Whether this subscriber is an effect. @readonly @type {false} */
  isEffect = false;
  /** A set of all subscriptions. @readonly @type {Set<Primary>} */
  primaries = new Set();
  /** The last computation result. @private @type {TValue} */
  value = /** @type {any} */ (null);
  /** Whether this signal needs to be recomputed. @type {boolean} */
  isDirty = true;
  /** A function that is used to subscribe to other signals and derive its value. @private @type {Compute<TValue>} */
  compute;

  /**
   * Creates a subscriber signal with a given computation function that is used to subscribe to other signals and derive its value.
   * @arg {Compute<TValue>} compute
   */
  constructor(compute) {
    this.compute = compute;
  }

  notify() {
    this.isDirty = true;
  }

  /**
   * Checks if the computation is uninitialized/dirty, (re)computes if needed, and then returns the appropriate value.
   * @returns {TValue}
   */
  get() {
    const subGetterFn = createSubGetterFn(this);
    this.value = this.compute(subGetterFn);
    this.isDirty = false;

    // initialization logic no longer needed
    this.get = this.getWithoutInit;

    return this.value;
  }

  /**
   * After intialization, only checks if dirty.
   * @private
   * @returns {TValue}
   */
  getWithoutInit() {
    if (!this.isDirty) return this.value;

    this.value = this.compute(defaultGetterFn);
    this.isDirty = false;

    return this.value;
  }
}

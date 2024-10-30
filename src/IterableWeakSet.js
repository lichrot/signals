// Deno doesn't play nice with @import yet :'(
// /** @import { RegToken } from "./types.d.ts" */
/** @typedef {import("./types.d.ts").RegToken} RegToken */

/**
 * An iterable version of WeakSet.
 * @template {WeakKey} [TValue=WeakKey]
 */
export class IterableWeakSet {
  /** A map of all weak refs and their registration tokens. @private @type {Map<WeakRef<TValue>, RegToken>} */
  tokens = new Map();
  /** A map where value is used as a weak key to it's own weak ref: After value is GC'ed, map get's cleared automagically. @private @type {WeakMap<TValue, WeakRef<TValue>>} */
  refs = new WeakMap();
  /** Token map has to be cleaned manually in order to not leak empty weak refs and tokens. @private @type {FinalizationRegistry<WeakRef<TValue>>} */
  registry = new FinalizationRegistry(this.tokens.delete.bind(this.tokens)); // same as `((ref) => this.tokens.delete(ref))`
  /** It's weak set iterating time. @readonly @type {string} */
  [Symbol.toStringTag] = "IterableWeakSet";

  /**
   * Creates an iterable version of WeakSet.
   * @arg {readonly TValue[] | Iterable<TValue> | null} [iterable]
   */
  constructor(iterable) {
    if (!iterable) return;

    for (const value of iterable) {
      this.add(value);
    }
  }

  /** @arg {TValue} value @returns {boolean} */
  has(value) {
    return this.refs.has(value);
  }

  /** @arg {TValue} value @returns {this} */
  add(value) {
    if (this.has(value)) return this;

    const token = Symbol();
    const ref = new WeakRef(value);

    this.tokens.set(ref, token);
    this.refs.set(value, ref);
    this.registry.register(value, ref, token);

    return this;
  }

  /** @returns {IterableIterator<TValue>} */
  *[Symbol.iterator]() {
    for (const [ref, token] of this.tokens) {
      const value = ref.deref();

      // Although token map should be clear of any empty weak refs by this point, there's no guarantee that it will be:
      // after testing with forced GC (through --expose-gc), Node/Deno do NOT call FinalizationRegistry callbacks immediately
      // which can lead to token map containing empty refs for some time
      if (value) {
        yield value;
      } else {
        this.tokens.delete(ref);
        this.registry.unregister(token);
      }
    }
  }

  get size() {
    // We can't rely on token map for size since it can contain empty weak refs,
    // so we iterate over the entire map and skip GC'ed entries: see [Symbol.iterator] method above
    let size = 0;
    for (const _ of this) size += 1;
    return size;
  }

  /* Full implementation of other common Set methods that's not needed right now */

  // /** @arg {TValue} value @returns {boolean} */
  // delete(value) {
  //   const ref = this.refs.get(value);
  //   if (!ref) return false;

  //   const token = /** @type {RegToken} */ (this.tokens.get(ref));

  //   this.tokens.delete(ref);
  //   this.refs.delete(value);
  //   this.registry.unregister(token);

  //   return true;
  // }

  // /** @returns {void} */
  // clear() {
  //   for (const value of this) {
  //     this.delete(value);
  //   }
  // }

  // /**
  //  * @arg {(value: T, key: T, set: IterableWeakSet<TValue>) => void} callbackfn
  //  * @arg {unknown} [thisArg]
  //  * @returns {void}
  //  */
  // forEach(callbackfn, thisArg) {
  //   for (const value of this) {
  //     callbackfn.call(thisArg, value, value, this);
  //   }
  // }

  // /** @returns {IterableIterator<TValue>} */
  // keys() {
  //   return this[Symbol.iterator]();
  // }

  // /** @returns {IterableIterator<TValue>} */
  // values() {
  //   return this[Symbol.iterator]();
  // }

  // /** @returns {IterableIterator<[TValue, TValue]>} */
  // *entries() {
  //   for (const value of this) {
  //     yield [value, value];
  //   }
  // }
}

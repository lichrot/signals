import type { RegToken } from "./types.ts";

/** An iterable version of WeakSet. */
export class IterableWeakSet<TValue extends WeakKey = WeakKey> {
  /** A map of all weak refs and their registration tokens. */
  private readonly tokens: Map<WeakRef<TValue>, RegToken> = new Map();
  /** A map where value is used as a weak key to it's own weak ref: After value is GC'ed, map get's cleared automagically. */
  private readonly refs: WeakMap<TValue, WeakRef<TValue>> = new WeakMap();
  /** Token map has to be cleaned manually in order to not leak empty weak refs and tokens. */
  private readonly registry: FinalizationRegistry<WeakRef<TValue>> =
    new FinalizationRegistry(this.tokens.delete.bind(this.tokens)); // same as `((ref) => this.tokens.delete(ref))`
  /** It's weak set iterating time. */
  readonly [Symbol.toStringTag]: string = "IterableWeakSet";

  /**
   * Creates an iterable version of WeakSet.
   * @param iterable Iterable to construct this IterableWeakSet from
   */
  constructor(iterable?: readonly TValue[] | Iterable<TValue> | null) {
    if (!iterable) return;

    for (const value of iterable) {
      this.add(value);
    }
  }

  /**
   * Checks whether an element with the specified value exists in the IterableWeakSet or not.
   * @param value
   * @returns A boolean indicating whether an element with the specified value exists in the IterableWeakSet or not
   */
  has(value: TValue): boolean {
    return this.refs.has(value);
  }

  /**
   * Appends a new element with a specified value to the end of the IterableWeakSet.
   * @param value A value to add
   * @returns The original IterableWeakSet
   */
  add(value: TValue): this {
    if (this.has(value)) return this;

    const token = Symbol();
    const ref = new WeakRef(value);

    this.tokens.set(ref, token);
    this.refs.set(value, ref);
    this.registry.register(value, ref, token);

    return this;
  }

  /**
   * Returns IterableIterator that produces currently existing elements
   * @returns IterableIterator that produces currently existing elements
   */
  *[Symbol.iterator](): IterableIterator<TValue> {
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

  /**
   * Returns the number of (unique) elements in IterableWeakSet.
   * @returns The number of (unique) elements in IterableWeakSet
   */
  get size(): number {
    // We can't rely on token map for size since it can contain empty weak refs,
    // so we iterate over the entire map and skip GC'ed entries: see [Symbol.iterator] method above
    let size = 0;
    for (const _ of this) size += 1;
    return size;
  }

  /* Full implementation of other common Set methods that's not needed right now */

  // /**
  //  * Removes a specified value from the IterableWeakSet.
  //  * @param value A value to remove
  //  * @returns Returns true if an element in the IterableWeakSet existed and has been removed, or false if the element does not exist
  //  */
  // delete(value: TValue) {
  //   const ref = this.refs.get(value);
  //   if (!ref) return false;

  //   const token = this.tokens.get(ref)!;

  //   this.tokens.delete(ref);
  //   this.refs.delete(value);
  //   this.registry.unregister(token);

  //   return true;
  // }

  // /** Purges all existing elements from the IterableWeakSet */
  // clear(): void {
  //   for (const value of this) {
  //     this.delete(value);
  //   }
  // }

  // /**
  //  * Executes a provided function once per each value in the IterableWeakSet object, in insertion order.
  //  * @param callbackfn A function to use with each value
  //  * @param thisArg A reference to an object to use as this inside the callback function
  //  */
  // forEach(callbackfn: (value: TValue, key: TValue, set: IterableWeakSet<TValue>) => void, thisArg?: unknown): void {
  //   for (const value of this) {
  //     callbackfn.call(thisArg, value, value, this);
  //   }
  // }

  // /**
  //  * Returns IterableIterator that produces currently existing elements
  //  * @returns IterableIterator that produces currently existing elements
  //  */
  // keys(): IterableIterator<TValue> {
  //   return this[Symbol.iterator]();
  // }

  // /**
  //  * Returns IterableIterator that produces currently existing elements
  //  * @returns IterableIterator that produces currently existing elements
  //  */
  // values(): IterableIterator<TValue> {
  //   return this[Symbol.iterator]();
  // }

  // /**
  //  * Returns IterableIterator that produces currently existing elements and their keys (i.e. values themselves)
  //  * @returns IterableIterator that produces currently existing elements and their keys (i.e. values themselves)
  //  */
  // *entries(): IterableIterator<[TValue, TValue]> {
  //   for (const value of this) {
  //     yield [value, value];
  //   }
  // }
}

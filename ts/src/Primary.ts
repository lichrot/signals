import type { Comp } from "./Comp.ts";
import { IterableWeakSet } from "./IterableWeakSet.ts";

/** A primary signal that notifies it's subscribers about it's mutations. */
// deno-lint-ignore no-explicit-any
export class Primary<T = any> {
  /** A set of all unique subscribers. */
  readonly comps: IterableWeakSet<Comp> = new IterableWeakSet();
  /** The current value of this signal. */
  private value: T;

  /**
   * Creates a primary signal with a given initial value and possibly custom comparison function.
   * @param value Initial value to set this signal to
   */
  constructor(value: T) {
    this.value = value;
  }

  /**
   * Returns the current of value of this signal.
   * @returns The current value of this signal
   */
  get(): T {
    return this.value;
  }

  /**
   * Mutates the current value of this signal.
   *
   * If the new value is the same, then mutation and notification is aborted.
   * @param value A new value to set this signal to
   */
  set(value: T) {
    this.value = value;

    for (const comp of this.comps) {
      comp.notify();
    }
  }
}

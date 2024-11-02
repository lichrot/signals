import { IterableWeakSet } from "./IterableWeakSet.ts";
import type { ComparisonFn, Sub, UrSignal } from "./types.ts";

/** A primary signal that notifies it's subscribers about it's mutations. */
// deno-lint-ignore no-explicit-any
export class Primary<TValue = any> implements UrSignal<TValue> {
  /** This can be set to change the default comparison of values when mutating. */
  static comparisonFnDefault: ComparisonFn = Object.is;
  /** Whether this entity is a primary signal. */
  readonly isPrimary: true = true;
  /** A set of all unique subscribers. */
  readonly subs: IterableWeakSet<Sub> = new IterableWeakSet();
  /** Function to use for comparison of values when mutating. */
  private comparisonFn: ComparisonFn<TValue>;
  /** The current value of this signal. */
  private value: TValue;

  /**
   * Creates a primary signal with a given initial value and possibly custom comparison function.
   * @param value Initial value to set this signal to
   */
  constructor(value: TValue);
  /**
   * Creates a primary signal with a given initial value and possibly custom comparison function.
   *
   * Individual primary signals can be set to use custom comparison function.
   * If custom comparison function is passed, then it will always be used instead of the default one.
   * @param value Initial value to set this signal to
   * @param comparisonFnCustom Custom comparison function that will be used by this signal
   */
  constructor(value: TValue, comparisonFnCustom?: ComparisonFn<TValue>);
  /**
   * Creates a primary signal with a given initial value and possibly custom comparison function.
   * @param value Initial value to set this signal to
   * @param comparisonFnCustom Custom comparison function that will be used by this signal
   */
  constructor(value: TValue, comparisonFnCustom?: ComparisonFn<TValue>) {
    this.value = value;
    this.comparisonFn = comparisonFnCustom ?? Primary.comparisonFnDefault;
  }

  /** Returns the current of value of this signal. @returns The current value of this signal */
  get(): TValue {
    return this.value;
  }

  /**
   * Mutates the current value of this signal.
   *
   * If the new value is the same (checked with default or custom comparison function),
   * then mutation and notification is aborted.
   * @param value A new value to set this signal to
   */
  set(value: TValue): void {
    if (this.comparisonFn(this.value, value)) return;

    this.value = value;

    for (const sub of this.subs) {
      sub.notify();
    }
  }
}

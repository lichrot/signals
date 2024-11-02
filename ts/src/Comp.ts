import type { Primary } from "./Primary.ts";
import type { Compute, UrSignal, UrSub } from "./types.ts";
import { createSubGetterFn, defaultGetterFn } from "./utils.ts";

/** A subscriber signal that recomputes each time it's subscriptions have mutated. Recomputions are lazy (on demand). */
// deno-lint-ignore no-explicit-any
export class Comp<TValue = any> implements UrSub, UrSignal<TValue> {
  /** Whether this entity is a primary signal. */
  readonly isPrimary: false = false;
  /** Whether this subscriber is an effect. */
  readonly isEffect: false = false;
  /** A set of all subscriptions. */
  readonly primaries: Set<Primary> = new Set();
  /** The last computation result. */
  private value: TValue = null!;
  /** Whether this signal needs to be recomputed. */
  isDirty: boolean = true;
  /** A function that is used to subscribe to other signals and derive its value. */
  private compute: Compute<TValue>;

  /**
   * Creates a subscriber signal with a given computation function that is used to subscribe to other signals and derive its value.
   * @param compute A function that is used to subscribe to other signals and derive its value
   */
  constructor(compute: Compute<TValue>) {
    this.compute = compute;
  }

  /** Notify this subscriber that its subscription mutated. */
  notify(): void {
    this.isDirty = true;
  }

  /**
   * Checks if the computation is uninitialized/dirty, (re)computes if needed, and then returns the appropriate value.
   * @returns The latest (re)computed value
   */
  get(): TValue {
    const subGetterFn = createSubGetterFn(this);
    this.value = this.compute(subGetterFn);
    this.isDirty = false;

    // initialization logic no longer needed
    this.get = this.getWithoutSubscription;

    return this.value;
  }

  /**
   * After intialization, only checks if dirty.
   * @returns The latest (re)computed value
   */
  private getWithoutSubscription(): TValue {
    if (!this.isDirty) return this.value;

    this.value = this.compute(defaultGetterFn);
    this.isDirty = false;

    return this.value;
  }
}

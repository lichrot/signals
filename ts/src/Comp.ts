import type { Primary } from "./Primary.ts";
import type { Compute, Signal, Track } from "./types.ts";

/**
 * Subscribes given subscriber to primary signals up the chain.
 * @param comp A subscriber to subscribe
 * @param signal A signal to subscribe subscriber to
 */
// deno-lint-ignore no-explicit-any
const subscribe = <T = any>(comp: Comp, signal: Signal<T>): T => {
  // Initialize lazy signals in order to get the subscriptions
  const value = signal.get();

  // deno-lint-ignore no-explicit-any
  const primaries = (signal as any).primaries
    ? (signal as Comp).primaries
    : [signal as Primary];

  for (const primary of primaries) {
    comp.primaries.add(primary);
    primary.comps.add(comp);
  }

  return value;
};

/** Just gets signal's value */
const track: Track = (signal) => signal.get();

/** A subscriber signal that recomputes each time it's subscriptions have mutated. Recomputions are lazy (on demand). */
// deno-lint-ignore no-explicit-any
export class Comp<T = any> {
  /** A set of all subscriptions. */
  readonly primaries: Set<Primary> = new Set();
  /** The last computation result. */
  private value: T = null!;
  /** Whether this signal needs to be recomputed. */
  dirty: boolean = true;
  /** A function that is used to subscribe to other signals and derive its value. */
  private compute: Compute<T>;

  /**
   * Creates a subscriber signal with a given computation function that is used to subscribe to other signals and derive its value.
   * @param compute A function that is used to subscribe to other signals and derive its value
   */
  constructor(compute: Compute<T>) {
    this.compute = compute;
  }

  /** Notify this subscriber that its subscription mutated. */
  notify(): void {
    this.dirty = true;
  }

  /**
   * Checks if the computation is uninitialized/dirty, (re)computes if needed, and then returns the appropriate value.
   * @returns The latest (re)computed value
   */
  get(): T {
    this.value = this.compute((signal) => subscribe(this, signal));
    this.dirty = false;
    this.get = this.noSubGet;
    return this.value;
  }

  /**
   * After intialization, only checks if dirty.
   * @returns The latest (re)computed value
   */
  protected noSubGet(): T {
    if (!this.dirty) return this.value;
    this.dirty = false;
    return this.value = this.compute(track);
  }
}

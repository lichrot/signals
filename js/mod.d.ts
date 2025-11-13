declare class IterableWeakSet<T extends WeakKey = WeakKey> {
  /** A map of all weak refs and their registration tokens. */
  private readonly tokens;
  /** A map where value is used as a weak key to it's own weak ref: After value is GC'ed, map get's cleared automagically. */
  private readonly refs;
  /** Token map has to be cleaned manually in order to not leak empty weak refs and tokens. */
  private readonly registry;
  /**
   * Appends a new element with a specified value to the end of the IterableWeakSet.
   * @param value A value to add
   * @returns The original IterableWeakSet
   */
  add(value: T): this;
  /**
   * Returns IterableIterator that produces currently existing elements
   * @returns IterableIterator that produces currently existing elements
   */
  [Symbol.iterator](): IterableIterator<T>;
}
/** A primary signal that notifies it's subscribers about it's mutations. */
export declare class Primary<T = any> {
  /** A set of all unique subscribers. */
  readonly comps: IterableWeakSet<Comp>;
  /** The current value of this signal. */
  private value;
  /**
   * Creates a primary signal with a given initial value and possibly custom comparison function.
   * @param value Initial value to set this signal to
   */
  constructor(value: T);
  /**
   * Returns the current of value of this signal.
   * @returns The current value of this signal
   */
  get(): T;
  /**
   * Mutates the current value of this signal.
   *
   * If the new value is the same, then mutation and notification is aborted.
   * @param value A new value to set this signal to
   */
  set(value: T): void;
}
/** A subscriber signal that recomputes each time it's subscriptions have mutated. Recomputions are lazy (on demand). */
export declare class Comp<T = any> {
  /** A set of all subscriptions. */
  readonly primaries: Set<Primary>;
  /** The last computation result. */
  private value;
  /** Whether this signal needs to be recomputed. */
  dirty: boolean;
  /** A function that is used to subscribe to other signals and derive its value. */
  private compute;
  /**
   * Creates a subscriber signal with a given computation function that is used to subscribe to other signals and derive its value.
   * @param compute A function that is used to subscribe to other signals and derive its value
   */
  constructor(compute: Compute<T>);
  /** Notify this subscriber that its subscription mutated. */
  notify(): void;
  /**
   * Checks if the computation is uninitialized/dirty, (re)computes if needed, and then returns the appropriate value.
   * @returns The latest (re)computed value
   */
  get(): T;
  /**
   * After intialization, only checks if dirty.
   * @returns The latest (re)computed value
   */
  protected noSubGet(): T;
}
/** Any signal entity that can be subscribed to. */
export type Signal<T = any> = Primary<T> | Comp<T>;
/** Getter function that extracts values from singal entities. */
export type Track = <T = any>(signal: Signal<T>) => T;
/** Function that is used to subscribe to other signals and derive a value. */
export type Compute<T = any> = (track: Track) => T;
/** Unregesters given effect, halting it and allowing it to be GC'ed. */
export type ClearEffect = () => void;
/**
 * Creates an effect that reexecutes each time it's subscriptions mutate.
 *
 * Reexuctions don't happen synchronously, and are scheduled with
 * [queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) by default.
 *
 * @example
 * Setup an effect.
 * ```ts
 * const aSig = createSignal(10);
 * const bSig = createSignal(20);
 * const sumSig = createSignal((track) => track(aSig) + track(bSig));
 *
 * const clearEffect = createEffect(
 *   (track) => console.log(`${track(aSig)} + ${track(bSig)} = ${track(sumSig)}`),
 * );
 *
 * // ... after effect is no longer needed
 *
 * clearEffect();
 * ```
 * @param compute A function that is used to subscribe to other signals and execute side effects
 * @returns A function that clears the registered effect
 */
export declare function createEffect(
  compute: Compute<void | PromiseLike<void>>,
): ClearEffect;
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
export declare function createSignal<T>(compute: Compute<T>): Comp<T>;
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
export declare function createSignal<T>(value: T): Primary<T>;
/**
 * An effect that reexecutes each time it's subscriptions mutate.
 *
 * Reexuctions don't happen synchronously, and are scheduled with
 * [queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) by default.
 */
export declare class Effect extends Comp<void | PromiseLike<void>> {
  /**
   * Creates an effect with a given effect function and possibly custom scheduling.
   * @param compute A function that is used to subscribe to other signals and execute side effects
   */
  constructor(compute: Compute<void | PromiseLike<void>>);
  notify(): void;
}

export {};

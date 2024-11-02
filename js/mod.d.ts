declare class IterableWeakSet<TValue extends WeakKey = WeakKey> {
  /** A map of all weak refs and their registration tokens. */
  private readonly tokens;
  /** A map where value is used as a weak key to it's own weak ref: After value is GC'ed, map get's cleared automagically. */
  private readonly refs;
  /** Token map has to be cleaned manually in order to not leak empty weak refs and tokens. */
  private readonly registry;
  /** It's weak set iterating time. */
  readonly [Symbol.toStringTag]: string;
  /**
   * Creates an iterable version of WeakSet.
   * @param iterable Iterable to construct this IterableWeakSet from
   */
  constructor(iterable?: readonly TValue[] | Iterable<TValue> | null);
  /**
   * Checks whether an element with the specified value exists in the IterableWeakSet or not.
   * @param value
   * @returns A boolean indicating whether an element with the specified value exists in the IterableWeakSet or not
   */
  has(value: TValue): boolean;
  /**
   * Appends a new element with a specified value to the end of the IterableWeakSet.
   * @param value A value to add
   * @returns The original IterableWeakSet
   */
  add(value: TValue): this;
  /**
   * Returns IterableIterator that produces currently existing elements
   * @returns IterableIterator that produces currently existing elements
   */
  [Symbol.iterator](): IterableIterator<TValue>;
  /**
   * Returns the number of (unique) elements in IterableWeakSet.
   * @returns The number of (unique) elements in IterableWeakSet
   */
  get size(): number;
}
/** A primary signal that notifies it's subscribers about it's mutations. */
export declare class Primary<TValue = any> implements UrSignal<TValue> {
  /** This can be set to change the default comparison of values when mutating. */
  static comparisonFnDefault: ComparisonFn;
  /** Whether this entity is a primary signal. */
  readonly isPrimary: true;
  /** A set of all unique subscribers. */
  readonly subs: IterableWeakSet<Sub>;
  /** Function to use for comparison of values when mutating. */
  private comparisonFn;
  /** The current value of this signal. */
  private value;
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
  /** Returns the current of value of this signal. @returns The current value of this signal */
  get(): TValue;
  /**
   * Mutates the current value of this signal.
   *
   * If the new value is the same (checked with default or custom comparison function),
   * then mutation and notification is aborted.
   * @param value A new value to set this signal to
   */
  set(value: TValue): void;
}
/**
 * An effect that reexecutes each time it's subscriptions mutate.
 *
 * Reexuctions don't happen synchronously, and are scheduled with
 * [queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) by default.
 *
 * To change effect scheduling globally set {@link Effect.schedulerFnDefault}.
 */
export declare class Effect implements UrSub {
  /** This can be set to change the default way of scheduling effects. */
  static schedulerFnDefault: SchedulerFn;
  /** Whether this entity is a primary signal. */
  readonly isPrimary: false;
  /** Whether this subscriber is an effect. */
  readonly isEffect: true;
  /** A set of all subscriptions. */
  readonly primaries: Set<Primary>;
  /** Whether this effect is scheduled to run. */
  isScheduled: boolean;
  /** Whether this effect is running. Can be set to true to be ended prematurely. */
  isStopped: boolean;
  /** This effect's scheduling function. */
  private schedulerFn;
  /** A function that is used to subscribe to other signals and execute side effects. */
  private effectFn;
  /**
   * Creates an effect with a given effect function and possibly custom scheduling.
   * @param effectFn A function that is used to subscribe to other signals and execute side effects
   */
  constructor(effectFn: EffectFn);
  /**
   * Creates an effect with a given effect function and possibly custom scheduling.
   *
   * Individual effects can be set to use custom scheduler function.
   * If custom scheduler function is passed, then it will always be used instead of the default one.
   * @param effectFn A function that is used to subscribe to other signals and execute side effects
   * @param schedulerFnCustom A function that will be used to schedule effects
   */
  constructor(effectFn: EffectFn, schedulerFnCustom?: SchedulerFn);
  /** Notify this subscriber that its subscription mutated. */
  notify(): void;
  /** Executes the effect and resets scheduling. */
  private execute;
}
/** A subscriber signal that recomputes each time it's subscriptions have mutated. Recomputions are lazy (on demand). */
export declare class Comp<TValue = any> implements UrSub, UrSignal<TValue> {
  /** Whether this entity is a primary signal. */
  readonly isPrimary: false;
  /** Whether this subscriber is an effect. */
  readonly isEffect: false;
  /** A set of all subscriptions. */
  readonly primaries: Set<Primary>;
  /** The last computation result. */
  private value;
  /** Whether this signal needs to be recomputed. */
  isDirty: boolean;
  /** A function that is used to subscribe to other signals and derive its value. */
  private compute;
  /**
   * Creates a subscriber signal with a given computation function that is used to subscribe to other signals and derive its value.
   * @param compute A function that is used to subscribe to other signals and derive its value
   */
  constructor(compute: Compute<TValue>);
  /** Notify this subscriber that its subscription mutated. */
  notify(): void;
  /**
   * Checks if the computation is uninitialized/dirty, (re)computes if needed, and then returns the appropriate value.
   * @returns The latest (re)computed value
   */
  get(): TValue;
  /**
   * After intialization, only checks if dirty.
   * @returns The latest (re)computed value
   */
  private getWithoutSubscription;
}
/** Basic entity. */
export type UrEntity = {
  isPrimary: boolean;
};
/** Basic signal entity. */
export type UrSignal<TValue = any> = UrEntity & {
  get: () => TValue;
};
/** Basic subscriber entity. */
export type UrSub = UrEntity & {
  isPrimary: false;
  isEffect: boolean;
  primaries: Set<Primary>;
  notify: () => void;
};
/** Any signal entity that can be subscribed to. */
export type Signal<TValue = any> = Primary<TValue> | Comp<TValue>;
/** Any subscriber entity that can subscribe to signal entities. */
export type Sub = Comp | Effect;
/** Extracts the value from a signal entity. */
export type Gotten<TSignal extends Signal> = TSignal extends Signal<infer T> ? T
  : unknown;
/** Basic getter function */
export type UrGet = <TSignal extends Signal>(
  signal: TSignal,
) => Gotten<TSignal>;
/** Helper function that takes an arbitrary number of signals. */
export type GetAll = <
  TSignals extends [
    Signal,
    ...Signal[],
  ],
>(signals: TSignals) => {
  [Index in keyof TSignals]: Gotten<TSignals[Index]>;
};
/** Getter function that extracts values from singal entities. */
export type Get = UrGet & {
  all: GetAll;
};
/** Function that is used to subscribe to other signals and derive a value. */
export type Compute<TValue> = (get: Get) => TValue;
/** Function that is used to subscribe to other signals and execute side effects. */
export type EffectFn = Compute<void | Promise<void>>;
/** Function that is used to schedule effects. */
export type SchedulerFn = (cbFn: () => void) => void;
/** Function that is used to compare values before committing the result. */
export type ComparisonFn<TValue = any> = (lhv: TValue, rhv: TValue) => boolean;
/** Unique identifier for effects. */
export type EffectToken = symbol;
/**
 * Creates an effect that reexecutes each time it's subscriptions mutate.
 *
 * Reexuctions don't happen synchronously, and are scheduled with
 * [queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) by default.
 *
 * To change effect scheduling globally set {@link Effect.schedulerFnDefault}.
 *
 * @example
 * Use [setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout)
 * for scheduling an effect as a delayed event loop task.
 * ```ts
 * const aSig = createSignal(10);
 * const bSig = createSignal(20);
 * const sumSig = createSignal((get) => get(aSig) + get(bSig));
 *
 * const taskDelay = 1000;
 * const scheduleTaskAfterDelay = (fn) => setTimeout(fn, taskDelay);
 * const effectToken = createEffect(
 *   (get) => console.log(`${get(aSig)} + ${get(bSig)} = ${get(sumSig)}`),
 *   scheduleTaskAfterDelay,
 * );
 *
 * // ... after effect is no longer needed
 *
 * stopEffect(effectToken);
 * ```
 * @param effectFn A function that is used to subscribe to other signals and execute side effects
 * @returns A unique identifier for this effect
 */
export declare function createEffect(effectFn: EffectFn): EffectToken;
/**
 * Creates an effect that reexecutes each time it's subscriptions mutate.
 *
 * Reexuctions don't happen synchronously, and are scheduled with
 * [queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) by default.
 *
 * To change effect scheduling globally set {@link Effect.schedulerFnDefault}.
 *
 * Individual effects can be set to use custom scheduler function.
 * If custom scheduler function is passed, then it will always be used instead of the default one.
 *
 * @example
 * Use [setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout)
 * for scheduling an effect as a delayed event loop task.
 * ```ts
 * const aSig = createSignal(10);
 * const bSig = createSignal(20);
 * const sumSig = createSignal((get) => get(aSig) + get(bSig));
 *
 * const taskDelay = 1000;
 * const scheduleTaskAfterDelay = (fn) => setTimeout(fn, taskDelay);
 * const effectToken = createEffect(
 *   (get) => console.log(`${get(aSig)} + ${get(bSig)} = ${get(sumSig)}`),
 *   scheduleTaskAfterDelay,
 * );
 *
 * // ... after effect is no longer needed
 *
 * stopEffect(effectToken);
 * ```
 * @param effectFn A function that is used to subscribe to other signals and execute side effects
 * @param schedulerFnCustom A function that will be used to schedule effects
 * @returns A unique identifier for this effect
 */
export declare function createEffect(
  effectFn: EffectFn,
  schedulerFnCustom?: SchedulerFn,
): EffectToken;
/**
 * Unregesters given effect, halting it and allowing it to be GC'ed.
 * @param effectToken A unique identifier for the effect
 */
export declare function clearEffect(effectToken: EffectToken): void;
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
 * const sumSig = createSignal((get) => get(aSig) + get(bSig));
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
export declare function createSignal<TValue>(
  compute: Compute<TValue>,
): Comp<TValue>;
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
 * const sumSig = createSignal((get) => get(aSig) + get(bSig));
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
export declare function createSignal<TValue>(value: TValue): Primary<TValue>;
/**
 * Creates a primary signal that notifies it's subscribers about it's mutations.
 *
 * Although mutations are synchronous, subscriber signals recompute lazily (on demand),
 * and effects are scheduled to execute with [queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) by default.
 *
 * Individual primary signals can be set to use custom comparison function.
 * If custom comparison function is passed, then it will always be used instead of the default one.
 *
 * @example Create a computed signal
 * ```ts
 * const aSig = createSignal(10);
 * const bSig = createSignal(20);
 * const sumSig = createSignal((get) => get(aSig) + get(bSig));
 *
 * console.log(sumSig.get()); // prints "30"
 *
 * aSig.set(30);
 * bSig.set(40);
 *
 * console.log(sumSig.get()); // prints "70"
 * ```
 * @param value Initial value to set this signal to
 * @param customComparisonFn Custom comparison function that will be used by this signal
 * @returns A primary signal that notifies it's subscribers about it's mutations
 */
export declare function createSignal<TValue>(
  value: TValue,
  customComparisonFn?: ComparisonFn<TValue>,
): Primary<TValue>;

export {};

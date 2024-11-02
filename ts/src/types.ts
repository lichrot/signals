import type { Effect } from "./Effect.ts";
import type { Primary } from "./Primary.ts";
import type { Comp } from "./Comp.ts";

/** Basic entity. */
type UrEntity = { isPrimary: boolean };

/** Basic signal entity. */
// deno-lint-ignore no-explicit-any
export type UrSignal<TValue = any> = UrEntity & { get: () => TValue };

/** Basic subscriber entity. */
export type UrSub = UrEntity & {
  isPrimary: false;
  isEffect: boolean;
  primaries: Set<Primary>;
  notify: () => void;
};

/** Any signal entity that can be subscribed to. */
// deno-lint-ignore no-explicit-any
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
export type GetAll = <TSignals extends [Signal, ...Signal[]]>(
  signals: TSignals,
) => {
  [Index in keyof TSignals]: Gotten<TSignals[Index]>;
};

/** Getter function that extracts values from singal entities. */
export type Get = UrGet & { all: GetAll };

/** Function that is used to subscribe to other signals and derive a value. */
export type Compute<TValue> = (get: Get) => TValue;

/** Function that is used to subscribe to other signals and execute side effects. */
export type EffectFn = Compute<void | Promise<void>>;

/** Function that is used to schedule effects. */
export type SchedulerFn = (cbFn: () => void) => void;

/** Function that is used to compare values before committing the result. */
// deno-lint-ignore no-explicit-any
export type ComparisonFn<TValue = any> = (lhv: TValue, rhv: TValue) => boolean;

/** Unique identifier for effects. */
export type EffectToken = symbol;

/** Unique identifier for FinalizationRegistry registrations. */
export type RegToken = Record<string, unknown>;

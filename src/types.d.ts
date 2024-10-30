import type { Effect } from "./Effect.js";
import type { Primary } from "./Primary.js";
import type { Comp } from "./Comp.js";

type UrEntity = { isPrimary: boolean };

// deno-lint-ignore no-explicit-any
export type UrSignal<TValue = any> = UrEntity & { get: () => TValue };

export type UrSub = UrEntity & {
  isPrimary: false;
  isEffect: boolean;
  primaries: Set<Primary>;
  notify: () => void;
};

// deno-lint-ignore no-explicit-any
export type Signal<TValue = any> = Primary<TValue> | Comp<TValue>;

export type Sub = Comp | Effect;

export type Gotten<TSignal extends Signal> = TSignal extends Signal<infer T> ? T
  : unknown;

export type UrGet = <TSignal extends Signal>(
  signal: TSignal,
) => Gotten<TSignal>;

export type GetAll = <TSignals extends [Signal, ...Signal[]]>(
  signals: TSignals,
) => {
  [Index in keyof TSignals]: Gotten<TSignals[Index]>;
};

export type Get = UrGet & { all: GetAll };

export type Compute<TValue> = (get: Get) => TValue;

export type EffectFn = Compute<void | Promise<void>>;

export type SchedulerFn = (cbFn: () => void) => void;

// deno-lint-ignore no-explicit-any
export type ComparisonFn<TValue = any> = (lhv: TValue, rhv: TValue) => boolean;

export type EffectToken = symbol;

export type RegToken = symbol;

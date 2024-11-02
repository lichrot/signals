import type { Comp } from "./Comp.ts";
import type { Primary } from "./Primary.ts";
import type { Get, GetAll, Signal, Sub, UrGet } from "./types.ts";

/**
 * Decorates a given getter function with a helper method.
 * @param getterFn A getter function to decorate
 * @returns A reference to the original function but with decorations
 */
const decorateGetterFn = (getterFn: UrGet): Get => {
  (getterFn as Get).all = ((signals) => signals.map(getterFn)) as GetAll;
  return getterFn as Get;
};

/** Just gets signal's value */
export const defaultGetterFn: Get = decorateGetterFn((signal) => signal.get());

/**
 * Subscribes given subscriber to primary signals up the chain.
 * @param sub A subscriber to subscribe
 * @param signal A signal to subscribe subscriber to
 */
const subscribe = (sub: Sub, signal: Signal): void => {
  const primaries = signal.isPrimary
    ? [signal as Primary]
    : (signal as Comp).primaries;

  for (const primary of primaries) {
    primary.subs.add(sub);
    sub.primaries.add(primary);
  }
};

/**
 * Creates a new getter function that also subscribes to primary signals up the chain.
 * @param sub A subscriber to subscribe
 * @returns A getter function that subscribes to signals
 */
export const createSubGetterFn = (sub: Sub): Get =>
  decorateGetterFn((signal) => {
    // Preemptively call get method in order to initialize lazy signals
    const value = signal.get();
    subscribe(sub, signal);
    return value;
  });

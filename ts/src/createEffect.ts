import { Effect } from "./Effect.ts";
import type { ClearEffect, Compute, Token } from "./types.ts";

/**
 * All currently registered effects.
 *
 * N.B. Plain Set cannot be used because cleanup function ({@link ClearEffect})
 * will keep the reference to the effect alive, rendering it un'GC'able until the cleanup function itself get's GC'ed.
 */
const EFFECT_MAP: Map<Token, Effect> = new Map();

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
export function createEffect(
  compute: Compute<void | PromiseLike<void>>,
): ClearEffect {
  const token: Token = {};
  EFFECT_MAP.set(token, new Effect(compute));
  return () => EFFECT_MAP.delete(token);
}

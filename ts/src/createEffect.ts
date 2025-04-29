import { Effect } from "./Effect.ts";
import type { Compute, Token } from "./types.ts";

/** All currently registered effects. */
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
 * const token = createEffect(
 *   (track) => console.log(`${track(aSig)} + ${track(bSig)} = ${track(sumSig)}`),
 * );
 *
 * // ... after effect is no longer needed
 *
 * clearEffect(token);
 * ```
 * @param compute A function that is used to subscribe to other signals and execute side effects
 * @returns A unique identifier for this effect
 */
export function createEffect(
  compute: Compute<void | PromiseLike<void>>,
): Token {
  const token: Token = {};
  EFFECT_MAP.set(token, new Effect(compute));
  return token;
}

/**
 * Unregesters given effect, halting it and allowing it to be GC'ed.
 * @param token A unique identifier for the effect
 */
export function clearEffect(token: Token): void {
  const effect = EFFECT_MAP.get(token);
  if (!effect) return;
  EFFECT_MAP.delete(token);
}

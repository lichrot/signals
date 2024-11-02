import { Effect } from "./Effect.ts";
import type { EffectFn, EffectToken, SchedulerFn } from "./types.ts";

/** All currently registered effects. */
const CUR_EFFECTS: Map<EffectToken, Effect> = new Map();

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
export function createEffect(effectFn: EffectFn): EffectToken;
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
export function createEffect(
  effectFn: EffectFn,
  schedulerFnCustom?: SchedulerFn,
): EffectToken;
/**
 * Creates an effect that reexecutes each time it's subscriptions mutate.
 * @param effectFn A function that is used to subscribe to other signals and execute side effects
 * @param schedulerFnCustom A function that will be used to schedule effects
 * @returns A unique identifier for this effect
 */
export function createEffect(
  effectFn: EffectFn,
  schedulerFnCustom?: SchedulerFn,
): EffectToken {
  const effectToken = Symbol();
  CUR_EFFECTS.set(effectToken, new Effect(effectFn, schedulerFnCustom));
  return effectToken;
}

/**
 * Unregesters given effect, halting it and allowing it to be GC'ed.
 * @param effectToken A unique identifier for the effect
 */
export function clearEffect(effectToken: EffectToken): void {
  const effect = CUR_EFFECTS.get(effectToken);
  if (!effect) return;

  // Prevents scheduled callbacks from running
  effect.isStopped = true;
  // Prevents callbacks from being scheduled
  effect.isScheduled = true;

  // By removing the effect from the map we cut off
  // the only strong reference to the effect and allow it to be GC'ed
  CUR_EFFECTS.delete(effectToken);
}

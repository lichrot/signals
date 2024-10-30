// Deno doesn't play nice with @import yet :'(
// /** @import { EffectFn, EffectToken, SchedulerFn } from "./types.d.ts" */
/** @typedef {import("./types.d.ts").EffectFn}    EffectFn    */
/** @typedef {import("./types.d.ts").EffectToken} EffectToken */
/** @typedef {import("./types.d.ts").SchedulerFn} SchedulerFn */
import { Effect } from "./Effect.js";

/** All currently registered effects. @type {Record<EffectToken, Effect>} */
const CUR_EFFECTS = {};

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
 * @overload
 * @arg {EffectFn} effectFn
 * @returns {EffectToken}
 */
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
 * @overload
 * @arg {EffectFn} effectFn
 * @arg {SchedulerFn} [schedulerFnCustom]
 * @returns {EffectToken}
 */
/**
 * @arg {EffectFn} effectFn
 * @arg {SchedulerFn} [schedulerFnCustom]
 * @returns {EffectToken}
 */
export function createEffect(effectFn, schedulerFnCustom) {
  const effectToken = Symbol();
  CUR_EFFECTS[effectToken] = new Effect(effectFn, schedulerFnCustom);
  return effectToken;
}

/**
 * Unregesters given effect, halting it and allowing it to be GC'ed.
 * @arg {EffectToken} effectToken
 * @returns {void}
 */
export function clearEffect(effectToken) {
  // Prevents scheduled callbacks from running
  CUR_EFFECTS[effectToken].isStopped = true;
  // Prevents callbacks from being scheduled
  CUR_EFFECTS[effectToken].isScheduled = true;
  // By deleting the effect we cut off
  // the only strong reference to the effect and allow it to be GC'ed
  delete CUR_EFFECTS[effectToken];
}

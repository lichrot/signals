// Deno doesn't play nice with @import yet :'(
// /** @import { Primary } from "./Primary.js" */
// /** @import { UrSub, EffectFn, SchedulerFn } from "./types.d.ts" */
/** @typedef {import("./Primary.js").Primary}     Primary     */
/** @typedef {import("./types.d.ts").UrSub}       UrSub       */
/** @typedef {import("./types.d.ts").EffectFn}    EffectFn    */
/** @typedef {import("./types.d.ts").SchedulerFn} SchedulerFn */
import { createSubGetterFn, defaultGetterFn } from "./utils.js";

/**
 * An effect that reexecutes each time it's subscriptions mutate.
 *
 * Reexuctions don't happen synchronously, and are scheduled with
 * [queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) by default.
 *
 * To change effect scheduling globally set {@link Effect.schedulerFnDefault}.
 * @implements {UrSub}
 */
export class Effect {
  /** This can be set to change the default way of scheduling effects. @type {SchedulerFn} */
  static schedulerFnDefault = queueMicrotask.bind(globalThis);
  /** Whether this entity is a primary signal. @readonly @type {false} */
  isPrimary = false;
  /** Whether this subscriber is an effect. @readonly @type {true} */
  isEffect = true;
  /** A set of all subscriptions. @readonly @type {Set<Primary>} */
  primaries = new Set();
  /** Whether this effect is scheduled to run. @type {boolean} */
  isScheduled = true;
  /** Whether this effect is running. Can be set to true to be ended prematurely. @type {boolean} */
  isStopped = false;
  /** This effect's scheduling function. @private @type {SchedulerFn} */
  schedulerFn;
  /** A function that is used to subscribe to other signals and execute side effects. @private @type {EffectFn} */
  effectFn;

  /**
   * Creates an effect with a given effect function and possibly custom scheduling.
   * @overload
   * @arg {EffectFn} effectFn
   */
  /**
   * Creates an effect with a given effect function and possibly custom scheduling.
   *
   * Individual effects can be set to use custom scheduler function.
   * If custom scheduler function is passed, then it will always be used instead of the default one.
   * @overload
   * @arg {EffectFn} effectFn
   * @arg {SchedulerFn} [schedulerFnCustom]
   */
  /**
   * @arg {EffectFn} effectFn
   * @arg {SchedulerFn} [schedulerFnCustom]
   */
  constructor(effectFn, schedulerFnCustom) {
    this.effectFn = effectFn;
    this.schedulerFn = schedulerFnCustom ?? Effect.schedulerFnDefault;
    // needs to be bound because it's used as a callback
    this.execute = this.execute.bind(this);

    // schedule initialization
    this.schedulerFn(() => {
      if (this.isStopped) return;
      const subGetterFn = createSubGetterFn(this);
      this.effectFn(subGetterFn);
      this.isScheduled = false;
    });
  }

  notify() {
    if (this.isScheduled) return;
    this.schedulerFn(this.execute);
    this.isScheduled = true;
  }

  /**
   * Executes the effect and resets scheduling.
   * @private
   * @returns {void}
   */
  execute() {
    if (this.isStopped) return;
    this.effectFn(defaultGetterFn);
    this.isScheduled = false;
  }
}

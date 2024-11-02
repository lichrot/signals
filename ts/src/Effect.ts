import type { Primary } from "./Primary.ts";
import type { EffectFn, SchedulerFn, UrSub } from "./types.ts";
import { createSubGetterFn, defaultGetterFn } from "./utils.ts";

/**
 * An effect that reexecutes each time it's subscriptions mutate.
 *
 * Reexuctions don't happen synchronously, and are scheduled with
 * [queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) by default.
 *
 * To change effect scheduling globally set {@link Effect.schedulerFnDefault}.
 */
export class Effect implements UrSub {
  /** This can be set to change the default way of scheduling effects. */
  static schedulerFnDefault: SchedulerFn = queueMicrotask.bind(globalThis);
  /** Whether this entity is a primary signal. */
  readonly isPrimary: false = false;
  /** Whether this subscriber is an effect. */
  readonly isEffect: true = true;
  /** A set of all subscriptions. */
  readonly primaries: Set<Primary> = new Set();
  /** Whether this effect is scheduled to run. */
  isScheduled: boolean = true;
  /** Whether this effect is running. Can be set to true to be ended prematurely. */
  isStopped: boolean = false;
  /** This effect's scheduling function. */
  private schedulerFn: SchedulerFn;
  /** A function that is used to subscribe to other signals and execute side effects. */
  private effectFn: EffectFn;

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
  /**
   * Creates an effect with a given effect function and possibly custom scheduling.
   * @param effectFn A function that is used to subscribe to other signals and execute side effects
   * @param schedulerFnCustom A function that will be used to schedule effects
   */
  constructor(effectFn: EffectFn, schedulerFnCustom?: SchedulerFn) {
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

  /** Notify this subscriber that its subscription mutated. */
  notify(): void {
    if (this.isScheduled) return;
    this.schedulerFn(this.execute);
    this.isScheduled = true;
  }

  /** Executes the effect and resets scheduling. */
  private execute(): void {
    if (this.isStopped) return;
    this.effectFn(defaultGetterFn);
    this.isScheduled = false;
  }
}

import { Comp } from "./Comp.ts";
import type { Compute } from "./types.ts";

/**
 * An effect that reexecutes each time it's subscriptions mutate.
 *
 * Reexuctions don't happen synchronously, and are scheduled with
 * [queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) by default.
 */
export class Effect extends Comp<void | PromiseLike<void>> {
  /**
   * Creates an effect with a given effect function and possibly custom scheduling.
   * @param compute A function that is used to subscribe to other signals and execute side effects
   */
  constructor(compute: Compute<void | PromiseLike<void>>) {
    super(compute);

    this.get = this.get.bind(this);
    this.noSubGet = this.noSubGet.bind(this);

    queueMicrotask(this.get);
  }

  override notify(): void {
    super.notify();
    queueMicrotask(this.get);
  }
}

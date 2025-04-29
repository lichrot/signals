import type { Comp } from "./Comp.ts";
import type { Primary } from "./Primary.ts";

/** Any signal entity that can be subscribed to. */
// deno-lint-ignore no-explicit-any
export type Signal<T = any> = Primary<T> | Comp<T>;

/** Getter function that extracts values from singal entities. */
// deno-lint-ignore no-explicit-any
export type Track = <T = any>(signal: Signal<T>) => T;

/** Function that is used to subscribe to other signals and derive a value. */
// deno-lint-ignore no-explicit-any
export type Compute<T = any> = (track: Track) => T;

/**
 * Unique identifier.
 *
 * NOTE: Firefox can't use non-registered symbols as FinalizationRegistry registration tokens yet:
 * [compatibility table](https://caniuse.com/?search=mdn-javascript_builtins_finalizationregistry_register_symbol_as_target)
 */
export type Token = Record<string, unknown>;

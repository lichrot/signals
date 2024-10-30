// deno-lint-ignore no-explicit-any
if (!(globalThis as any)?.gc) {
  throw new Error("No gc function");
}

/** Forces V8 garbage collection pass */
// deno-lint-ignore no-explicit-any
export const gc: () => void = (globalThis as any).gc;

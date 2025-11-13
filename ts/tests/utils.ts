// deno-lint-ignore no-explicit-any
if (!(globalThis as any)?.gc) {
  throw new Error("No GC function");
}

/** Forces V8 garbage collection pass */
// deno-lint-ignore no-explicit-any
export const gc: () => void = (globalThis as any).gc;

export const getSetSize = (set: Iterable<unknown>) => {
  let result = 0;
  for (const _ of set) {
    result += 1;
  }
  return result;
};

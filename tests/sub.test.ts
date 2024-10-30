import { assertEquals } from "jsr:@std/assert";
import { delay } from "jsr:@std/async";

import { createSignal } from "../mod.js";
import { gc } from "./gc.ts";

Deno.test("Subscriber signals", async ({ step }) => {
  const A_VALUE = 10;
  const B_VALUE = 20;

  await step("subscribe", () => {
    const aSig = createSignal(A_VALUE);
    const bSig = createSignal(B_VALUE);
    const sumSig = createSignal((get) => get(aSig) + get(bSig));

    sumSig.get(); // init
    assertEquals(sumSig.primaries.size, 2);
  });

  const getSumMessage = (
    a: number,
    b: number,
    sum: number,
  ) => `${a} + ${b} = ${sum}`;

  await step(
    "subscribe only to primaries",
    () => {
      const aSig = createSignal(A_VALUE);
      const bSig = createSignal(B_VALUE);
      const sumSig = createSignal((get) => get(aSig) + get(bSig));
      const deepSumSig = createSignal((get) =>
        getSumMessage(...get.all([aSig, bSig, sumSig]))
      );

      deepSumSig.get();
      assertEquals(deepSumSig.primaries.size, 2);
    },
  );

  const NEW_A_VALUE = 30;
  const NEW_B_VALUE = 40;

  await step("(re)compute on demand", () => {
    const aSig = createSignal(A_VALUE);
    const bSig = createSignal(B_VALUE);
    const sumSig = createSignal((get) => get(aSig) + get(bSig));
    const deepSumSig = createSignal((get) =>
      getSumMessage(...get.all([aSig, bSig, sumSig]))
    );

    // init
    deepSumSig.get();

    aSig.set(NEW_A_VALUE);
    assertEquals(sumSig.get(), NEW_A_VALUE + B_VALUE);
    assertEquals(deepSumSig.isDirty, true);

    bSig.set(NEW_B_VALUE);
    assertEquals(
      deepSumSig.get(),
      getSumMessage(
        NEW_A_VALUE,
        NEW_B_VALUE,
        NEW_A_VALUE + NEW_B_VALUE,
      ),
    );
    assertEquals(sumSig.isDirty, false);
    assertEquals(deepSumSig.isDirty, false);
  });

  const PRIMARY_COUNT = 100;

  await step("(re)compute once on batch mutations", () => {
    const numSigs = [...Array(PRIMARY_COUNT)].map((_, idx) =>
      createSignal(idx + 1)
    );

    let compCount = 0;
    const sumSig = createSignal((get) => {
      compCount += 1;

      let result = 0;
      for (const numSig of numSigs) {
        result += get(numSig);
      }

      return result;
    });

    assertEquals(compCount, 0);

    // sequential integer sigma sum
    let totalSum = PRIMARY_COUNT * (PRIMARY_COUNT + 1) / 2;
    assertEquals(sumSig.get(), totalSum);
    assertEquals(compCount, 1);

    totalSum += PRIMARY_COUNT;
    for (const numSig of numSigs) {
      numSig.set(numSig.get() + 1);
    }

    assertEquals(compCount, 1);
    assertEquals(sumSig.get(), totalSum);
    assertEquals(compCount, 2);
  });

  const DELAY = 1000 / 10;

  await step("work with async values and computations", async () => {
    const aAsyncSig = createSignal(Promise.resolve(A_VALUE));
    const bAsyncSig = createSignal(Promise.resolve(B_VALUE));
    const sumAsyncSig = createSignal(async (get) => {
      const [a, b] = await Promise.all(
        get.all([aAsyncSig, bAsyncSig]),
      );

      await delay(DELAY);

      return a + b;
    });

    const deepSumAsyncSig = createSignal(
      async (get) => {
        const args = await Promise.all(
          get.all([aAsyncSig, bAsyncSig, sumAsyncSig]),
        );

        await delay(DELAY);

        return getSumMessage(...args);
      },
    );

    assertEquals(
      await sumAsyncSig.get(),
      A_VALUE + B_VALUE,
    );

    aAsyncSig.set(Promise.resolve(NEW_A_VALUE));
    bAsyncSig.set(Promise.resolve(NEW_B_VALUE));

    assertEquals(
      await deepSumAsyncSig.get(),
      getSumMessage(
        NEW_A_VALUE,
        NEW_B_VALUE,
        NEW_A_VALUE + NEW_B_VALUE,
      ),
    );
  });

  await step("get GC'ed when no longer accessible", async () => {
    const primSig = createSignal(A_VALUE);

    (() => {
      for (let idx = 0; idx < 10000; idx++) {
        const compSig = createSignal((get) => get(primSig) ** 2);

        assertEquals(compSig.get(), A_VALUE ** 2);
        assertEquals(primSig.subs.size, idx + 1);
      }
    })();

    await delay(DELAY);
    gc();
    assertEquals(primSig.subs.size, 0);
  });
});

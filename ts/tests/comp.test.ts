import { assertEquals } from "jsr:@std/assert/equals";
import { delay } from "jsr:@std/async/delay";

import { createSignal } from "../mod.ts";
import { gc, getSetSize } from "./utils.ts";

Deno.test("Subscriber signals", async ({ step }) => {
  const A_VALUE = 10;
  const B_VALUE = 20;

  await step("subscribe", () => {
    const aSig = createSignal(A_VALUE);
    const bSig = createSignal(B_VALUE);
    const sumSig = createSignal((track) => track(aSig) + track(bSig));

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
      const sumSig = createSignal((track) => track(aSig) + track(bSig));
      const deepSumSig = createSignal((track) =>
        getSumMessage(
          ...[aSig, bSig, sumSig].map(track) as [number, number, number],
        )
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
    const sumSig = createSignal((track) => track(aSig) + track(bSig));
    const deepSumSig = createSignal((track) =>
      getSumMessage(
        ...[aSig, bSig, sumSig].map(track) as [number, number, number],
      )
    );

    // init
    deepSumSig.get();

    aSig.set(NEW_A_VALUE);
    assertEquals(sumSig.get(), NEW_A_VALUE + B_VALUE);
    assertEquals(deepSumSig.dirty, true);

    bSig.set(NEW_B_VALUE);
    assertEquals(
      deepSumSig.get(),
      getSumMessage(
        NEW_A_VALUE,
        NEW_B_VALUE,
        NEW_A_VALUE + NEW_B_VALUE,
      ),
    );
    assertEquals(sumSig.dirty, false);
    assertEquals(deepSumSig.dirty, false);
  });

  const PRIMARY_COUNT = 100;

  await step("(re)compute once on batch mutations", () => {
    const numSigs = [...Array(PRIMARY_COUNT)].map((_, idx) =>
      createSignal(idx + 1)
    );

    let compCount = 0;
    const sumSig = createSignal((track) => {
      compCount += 1;

      let result = 0;
      for (const numSig of numSigs) {
        result += track(numSig);
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
    const sumAsyncSig = createSignal(async (track) => {
      const [a, b] = await Promise.all([aAsyncSig, bAsyncSig].map(track));

      await delay(DELAY);

      return a + b;
    });

    const deepSumAsyncSig = createSignal(
      async (track) => {
        const args = await Promise.all(
          [aAsyncSig, bAsyncSig, sumAsyncSig].map(track),
        );

        await delay(DELAY);

        return getSumMessage(...args as [number, number, number]);
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
        const compSig = createSignal((track) => track(primSig) ** 2);

        assertEquals(compSig.get(), A_VALUE ** 2);
        assertEquals(getSetSize(primSig.comps), idx + 1);
      }
    })();

    await delay(DELAY);
    gc();
    assertEquals(getSetSize(primSig.comps), 0);
  });
});

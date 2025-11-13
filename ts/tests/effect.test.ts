import { assertEquals } from "jsr:@std/assert/equals";
import { delay } from "jsr:@std/async/delay";

import { createEffect, createSignal } from "../mod.ts";
import { gc, getSetSize } from "./utils.ts";

Deno.test("Effects", async ({ step }) => {
  const A_VALUE = 10;
  const B_VALUE = 20;

  await step("subscribe after event loop task is done", async () => {
    const aSig = createSignal(A_VALUE);
    const bSig = createSignal(B_VALUE);

    let sum = 0;
    createEffect((track) => {
      sum = track(aSig) + track(bSig);
    });

    assertEquals(getSetSize(aSig.comps), 0);
    assertEquals(getSetSize(bSig.comps), 0);
    assertEquals(sum, 0);

    await delay(0);

    assertEquals(getSetSize(aSig.comps), 1);
    assertEquals(getSetSize(bSig.comps), 1);
    assertEquals(sum, A_VALUE + B_VALUE);
  });

  const getSumMessage = (
    a: number,
    b: number,
    sum: number,
  ) => `${a} + ${b} = ${sum}`;

  await step("work with setTimeout scheduling", async () => {
    const aSig = createSignal(A_VALUE);
    const bSig = createSignal(B_VALUE);
    const sumSig = createSignal((track) => track(aSig) + track(bSig));

    let result = "";
    createEffect((track) => {
      result = getSumMessage(
        ...[aSig, bSig, sumSig].map(track) as [number, number, number],
      );
    });

    assertEquals(result, "");

    await delay(0);

    assertEquals(
      result,
      getSumMessage(
        A_VALUE,
        B_VALUE,
        A_VALUE + B_VALUE,
      ),
    );
  });

  const PRIMARY_COUNT = 100;

  await step("(re)compute once on batch mutations", async () => {
    const numSigs = [...Array(PRIMARY_COUNT)].map((_, idx) =>
      createSignal(idx + 1)
    );

    let compCount = 0;
    let result = 0;
    createEffect((track) => {
      compCount += 1;

      for (const numSig of numSigs) {
        result += track(numSig);
      }
    });

    assertEquals(result, 0);
    assertEquals(compCount, 0);

    await delay(0);

    // sequential integer sigma sum
    let totalSum = PRIMARY_COUNT * (PRIMARY_COUNT + 1) / 2;
    assertEquals(result, totalSum);
    assertEquals(compCount, 1);

    result = 0;
    totalSum += PRIMARY_COUNT;
    for (const numSig of numSigs) {
      numSig.set(numSig.get() + 1);
    }

    assertEquals(compCount, 1);

    await delay(0);

    assertEquals(result, totalSum);
    assertEquals(compCount, 2);
  });

  const DELAY = 1000 / 4;
  const NEW_A_VALUE = 30;
  const NEW_B_VALUE = 40;

  await step("work with async values and effect functions", async () => {
    const aAsyncSig = createSignal(Promise.resolve(A_VALUE));
    const bAsyncSig = createSignal(Promise.resolve(B_VALUE));
    const sumAsyncSig = createSignal(async (track) => {
      const [a, b] = await Promise.all([aAsyncSig, bAsyncSig].map(track));

      await delay(DELAY);

      return a + b;
    });

    let result = "";
    createEffect(
      async (track) => {
        const args = await Promise.all(
          [aAsyncSig, bAsyncSig, sumAsyncSig].map(track),
        );

        await delay(DELAY);

        result = getSumMessage(...args as [number, number, number]);
      },
    );

    // check result after 1st delay (sumAsyncSig) + 2nd delay (effect)
    await delay(DELAY * 3);
    assertEquals(result, getSumMessage(A_VALUE, B_VALUE, A_VALUE + B_VALUE));

    aAsyncSig.set(Promise.resolve(NEW_A_VALUE));
    bAsyncSig.set(Promise.resolve(NEW_B_VALUE));

    // check result after 1st delay (sumAsyncSig) + 2nd delay (effect)
    await delay(DELAY * 3);
    assertEquals(
      result,
      getSumMessage(NEW_A_VALUE, NEW_B_VALUE, NEW_A_VALUE + NEW_B_VALUE),
    );
  });

  await step("get gc'ed when no longer accessible", async () => {
    const primSig = createSignal(A_VALUE);

    let result = 0;
    const clearEffect = createEffect((track) => {
      result = track(primSig) ** 2;
    });

    await delay(0);
    assertEquals(result, A_VALUE ** 2);
    assertEquals(getSetSize(primSig.comps), 1);

    clearEffect();
    await delay(DELAY);
    gc();
    assertEquals(getSetSize(primSig.comps), 0);
  });
});

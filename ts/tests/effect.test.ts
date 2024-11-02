import { assertEquals } from "jsr:@std/assert";
import { delay } from "jsr:@std/async";

import { clearEffect, createEffect, createSignal } from "../mod.ts";
import { gc } from "./gc.ts";

Deno.test("Effects", async ({ step }) => {
  const A_VALUE = 10;
  const B_VALUE = 20;

  await step("subscribe after event loop task is done", async () => {
    const aSig = createSignal(A_VALUE);
    const bSig = createSignal(B_VALUE);

    let sum = 0;
    createEffect((get) => {
      sum = get(aSig) + get(bSig);
    });

    assertEquals(aSig.subs.size, 0);
    assertEquals(bSig.subs.size, 0);
    assertEquals(sum, 0);

    await delay(0);

    assertEquals(aSig.subs.size, 1);
    assertEquals(bSig.subs.size, 1);
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
    const sumSig = createSignal((get) => get(aSig) + get(bSig));

    let result = "";
    createEffect((get) => {
      result = getSumMessage(...get.all([aSig, bSig, sumSig]));
    }, setTimeout.bind(globalThis));

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
    createEffect((get) => {
      compCount += 1;

      for (const numSig of numSigs) {
        result += get(numSig);
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
    const sumAsyncSig = createSignal(async (get) => {
      const [a, b] = await Promise.all(
        get.all([aAsyncSig, bAsyncSig]),
      );

      await delay(DELAY);

      return a + b;
    });

    let result = "";
    createEffect(
      async (get) => {
        const args = await Promise.all(
          get.all([aAsyncSig, bAsyncSig, sumAsyncSig]),
        );

        await delay(DELAY);

        result = getSumMessage(...args);
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
    const token = createEffect((get) => {
      result = get(primSig) ** 2;
    });

    await delay(0);
    assertEquals(result, A_VALUE ** 2);
    assertEquals(primSig.subs.size, 1);

    clearEffect(token);
    await delay(DELAY);
    gc();
    assertEquals(primSig.subs.size, 0);
  });
});

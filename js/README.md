# [@qnd/signals] Yet another signal lib

[![Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://opensource.org/license/apache-2-0)
[![JSR Version](https://jsr.io/badges/@qnd/signals)](https://jsr.io/@qnd/signals)
[![NPM Version](https://img.shields.io/npm/v/@qnd/signals)](https://www.npmjs.com/package/@qnd/signals)

No promos here, just my implementation of signals.

## [💀] Example

```ts
import { createEffect, createSignal } from "@qnd/signals";

const aSig = createSignal(10);
const bSig = createSignal(20);
const sumSig = createSignal((track) => track(aSig) + track(bSig));

const token = createEffect((track) => {
  console.log(`${track(aSig)} + ${track(bSig)} = ${track(sumSig)}`);
});

// ... after effect is no longer needed

clearEffect(token);
```

## [💾] Installation

Choose your fighter:

```sh
npm   install @qnd/signals
yarn  add     @qnd/signals
pnpm  install @qnd/signals
deno  install jsr:@qnd/signals
```

## [🖥️] Tasks

```sh
# Run tests
deno task test

# Transpile to JS + D.TS
deno task transpile

# Run publishing in dry mode
deno task dry-run

# Prepare for publishing (does all of the above)
deno task prepare

# Publish to JSR and NPM
deno task publish
```

## [📝] License

This work is licensed under
[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0) (see
[NOTICE](/NOTICE)).

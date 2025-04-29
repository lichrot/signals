# [@apophatique/signals] Yet another signal lib

[![Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://opensource.org/license/apache-2-0)
[![JSR Version](https://jsr.io/badges/@apophatique/signals)](https://jsr.io/@apophatique/signals)
[![NPM Version](https://img.shields.io/npm/v/@apophatique/signals)](https://www.npmjs.com/package/@apophatique/signals)

No promos here, just my implementation of signals.

## [💀] Example

```ts
import { createEffect, createSignal } from "@apophatique/signals";

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
npm   install @apophatique/signals
yarn  add     @apophatique/signals
pnpm  install @apophatique/signals
deno  install jsr:@apophatique/signals
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

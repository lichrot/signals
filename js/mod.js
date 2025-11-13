const subscribe = (comp, signal) => {
  const value = signal.get();
  const primaries = signal.primaries ? signal.primaries : [
    signal,
  ];
  for (const primary of primaries) {
    comp.primaries.add(primary);
    primary.comps.add(comp);
  }
  return value;
};
const track = (signal) => signal.get();
class Comp {
  primaries = new Set();
  value = null;
  dirty = true;
  compute;
  constructor(compute) {
    this.compute = compute;
  }
  notify() {
    this.dirty = true;
  }
  get() {
    this.value = this.compute((signal) => subscribe(this, signal));
    this.dirty = false;
    this.get = this.noSubGet;
    return this.value;
  }
  noSubGet() {
    if (!this.dirty) return this.value;
    this.dirty = false;
    return this.value = this.compute(track);
  }
}
class Effect extends Comp {
  constructor(compute) {
    super(compute);
    this.get = this.get.bind(this);
    this.noSubGet = this.noSubGet.bind(this);
    queueMicrotask(this.get);
  }
  notify() {
    super.notify();
    queueMicrotask(this.get);
  }
}
const EFFECT_MAP = new Map();
function createEffect(compute) {
  const token = {};
  EFFECT_MAP.set(token, new Effect(compute));
  return () => EFFECT_MAP.delete(token);
}
var _computedKey;
_computedKey = Symbol.iterator;
class IterableWeakSet {
  tokens = new Map();
  refs = new WeakMap();
  registry = new FinalizationRegistry(this.tokens.delete.bind(this.tokens));
  add(value) {
    if (this.refs.has(value)) {
      return this;
    }
    const token = {};
    const ref = new WeakRef(value);
    this.tokens.set(ref, token);
    this.refs.set(value, ref);
    this.registry.register(value, ref, token);
    return this;
  }
  *[_computedKey]() {
    for (const [ref, token] of this.tokens) {
      const value = ref.deref();
      if (value) {
        yield value;
      } else {
        this.tokens.delete(ref);
        this.registry.unregister(token);
      }
    }
  }
}
const is = Object.is;
class Primary {
  comps = new IterableWeakSet();
  value;
  constructor(value) {
    this.value = value;
  }
  get() {
    return this.value;
  }
  set(value) {
    if (is(this.value, value)) return;
    this.value = value;
    for (const comp of this.comps) {
      comp.notify();
    }
  }
}
function createSignal(computeOrValue) {
  return typeof computeOrValue === "function"
    ? new Comp(computeOrValue)
    : new Primary(computeOrValue);
}
export { createEffect as createEffect, createSignal as createSignal };

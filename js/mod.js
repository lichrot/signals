const decorateGetterFn = (getterFn) => {
  getterFn.all = (signals) => signals.map(getterFn);
  return getterFn;
};
const defaultGetterFn = decorateGetterFn((signal) => signal.get());
const subscribe = (sub, signal) => {
  const primaries = signal.isPrimary
    ? [
      signal,
    ]
    : signal.primaries;
  for (const primary of primaries) {
    primary.subs.add(sub);
    sub.primaries.add(primary);
  }
};
const createSubGetterFn = (sub) =>
  decorateGetterFn((signal) => {
    const value = signal.get();
    subscribe(sub, signal);
    return value;
  });
class Effect {
  static schedulerFnDefault = queueMicrotask.bind(globalThis);
  isPrimary = false;
  isEffect = true;
  primaries = new Set();
  isScheduled = true;
  isStopped = false;
  schedulerFn;
  effectFn;
  constructor(effectFn, schedulerFnCustom) {
    this.effectFn = effectFn;
    this.schedulerFn = schedulerFnCustom ?? Effect.schedulerFnDefault;
    this.execute = this.execute.bind(this);
    this.schedulerFn(() => {
      if (this.isStopped) return;
      const subGetterFn = createSubGetterFn(this);
      this.effectFn(subGetterFn);
      this.isScheduled = false;
    });
  }
  notify() {
    if (this.isScheduled) return;
    this.schedulerFn(this.execute);
    this.isScheduled = true;
  }
  execute() {
    if (this.isStopped) return;
    this.effectFn(defaultGetterFn);
    this.isScheduled = false;
  }
}
const CUR_EFFECTS = new Map();
function createEffect(effectFn, schedulerFnCustom) {
  const effectToken = Symbol();
  CUR_EFFECTS.set(effectToken, new Effect(effectFn, schedulerFnCustom));
  return effectToken;
}
function clearEffect(effectToken) {
  const effect = CUR_EFFECTS.get(effectToken);
  if (!effect) return;
  effect.isStopped = true;
  effect.isScheduled = true;
  CUR_EFFECTS.delete(effectToken);
}
class Comp {
  isPrimary = false;
  isEffect = false;
  primaries = new Set();
  value = null;
  isDirty = true;
  compute;
  constructor(compute) {
    this.compute = compute;
  }
  notify() {
    this.isDirty = true;
  }
  get() {
    const subGetterFn = createSubGetterFn(this);
    this.value = this.compute(subGetterFn);
    this.isDirty = false;
    this.get = this.getWithoutSubscription;
    return this.value;
  }
  getWithoutSubscription() {
    if (!this.isDirty) return this.value;
    this.value = this.compute(defaultGetterFn);
    this.isDirty = false;
    return this.value;
  }
}
var _computedKey, _computedKey1;
_computedKey = Symbol.toStringTag, _computedKey1 = Symbol.iterator;
class IterableWeakSet {
  tokens = new Map();
  refs = new WeakMap();
  registry = new FinalizationRegistry(this.tokens.delete.bind(this.tokens));
  [_computedKey] = "IterableWeakSet";
  constructor(iterable) {
    if (!iterable) return;
    for (const value of iterable) {
      this.add(value);
    }
  }
  has(value) {
    return this.refs.has(value);
  }
  add(value) {
    if (this.has(value)) return this;
    const token = {};
    const ref = new WeakRef(value);
    this.tokens.set(ref, token);
    this.refs.set(value, ref);
    this.registry.register(value, ref, token);
    return this;
  }
  *[_computedKey1]() {
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
  get size() {
    let size = 0;
    for (const _ of this) size += 1;
    return size;
  }
}
class Primary {
  static comparisonFnDefault = Object.is;
  isPrimary = true;
  subs = new IterableWeakSet();
  comparisonFn;
  value;
  constructor(value, comparisonFnCustom) {
    this.value = value;
    this.comparisonFn = comparisonFnCustom ?? Primary.comparisonFnDefault;
  }
  get() {
    return this.value;
  }
  set(value) {
    if (this.comparisonFn(this.value, value)) return;
    this.value = value;
    for (const sub of this.subs) {
      sub.notify();
    }
  }
}
function createSignal(computeOrValue, customComparisonFn) {
  if (typeof computeOrValue === "function") {
    return new Comp(computeOrValue);
  }
  return new Primary(computeOrValue, customComparisonFn);
}
export {
  clearEffect as clearEffect,
  Comp as Comp,
  createEffect as createEffect,
  createSignal as createSignal,
  Effect as Effect,
  Primary as Primary,
};

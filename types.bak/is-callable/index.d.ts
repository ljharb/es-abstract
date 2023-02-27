declare module 'is-callable' {
  function isCallable(value: unknown): value is (...args: unknown[]) => unknown;
  export = isCallable;
}

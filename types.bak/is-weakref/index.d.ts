declare module 'is-weakref' {
    function isWeakRef<T extends object = object>(x: unknown): x is WeakRef<T>

    export = isWeakRef;
}
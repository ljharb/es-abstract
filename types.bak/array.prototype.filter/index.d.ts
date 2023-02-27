declare module 'array.prototype.filter' {
    // Type definitions for array.prototype.filter 1.0
    // Project: https://github.com/es-shims/Array.prototype.filter
    // Definitions by: Jordan Harband <https://github.com/ljharb>
    // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

    import implementation = require('array.prototype.filter/implementation');
    import getPolyfill = require('array.prototype.filter/polyfill');
    import shim = require('array.prototype.filter/shim');


    type Prepend<E, T extends any[]> = ((receiver: E, ...args: T) => any) extends ((...args: infer U) => any)
        ? U
        : T;

    type CallBound<F extends (...args: any[]) => any> =
        F extends (this: infer T, ...args: infer A) => infer R
        ? (...args: Prepend<T, A>) => R
        : never;

    const ArrayPrototypeFilter: CallBound<typeof implementation> & {
        readonly getPolyfill: typeof getPolyfill;
        readonly implementation: typeof implementation;
        readonly shim: typeof shim;
    };
    export = ArrayPrototypeFilter;
}

declare module 'array.prototype.filter/implementation' {
    const filter: typeof Array.prototype.filter;

    export = filter;
}

declare module 'array.prototype.filter/polyfill' {
    import filter = require('array.prototype.filter/implementation');

    function getPolyfill(): typeof filter;
    export = getPolyfill;
}

declare module 'array.prototype.filter/shim' {
    import filter = require('array.prototype.filter/implementation');

    function shimArrayPrototypeFilter(): typeof filter;
    export = shimArrayPrototypeFilter;
}
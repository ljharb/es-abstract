declare module 'array.prototype.indexof' {
    // Type definitions for array.prototype.indexof 1.0
    // Project: https://github.com/es-shims/Array.prototype.indexOf
    // Definitions by: Jordan Harband <https://github.com/ljharb>
    // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

    import implementation = require('array.prototype.indexof/implementation');
    import getPolyfill = require('array.prototype.indexof/polyfill');
    import shim = require('array.prototype.indexof/shim');


    type Prepend<E, T extends any[]> = ((receiver: E, ...args: T) => any) extends ((...args: infer U) => any)
        ? U
        : T;

    type CallBound<F extends (...args: any[]) => any> =
        F extends (this: infer T, ...args: infer A) => infer R
        ? (...args: Prepend<T, A>) => R
        : never;

    const ArrayPrototypeIndexOf: CallBound<typeof implementation> & {
        readonly getPolyfill: typeof getPolyfill;
        readonly implementation: typeof implementation;
        readonly shim: typeof shim;
    };
    export = ArrayPrototypeIndexOf;
}

declare module 'array.prototype.indexof/implementation' {
    const indexOf: typeof Array.prototype.indexOf;

    export = indexOf;
}

declare module 'array.prototype.indexof/polyfill' {
    import indexOf = require('array.prototype.indexof/implementation');

    function getPolyfill(): typeof indexOf;
    export = getPolyfill;
}

declare module 'array.prototype.indexof/shim' {
    import indexOf = require('array.prototype.indexof/implementation');

    function shimArrayPrototypeIndexOf(): typeof indexOf;
    export = shimArrayPrototypeIndexOf;
}

declare module 'string.prototype.trim' {
    // Type definitions for string.prototype.trim 1.0
    // Project: https://github.com/es-shims/String.prototype.trim
    // Definitions by: Jordan Harband <https://github.com/ljharb>
    // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

    import implementation = require('string.prototype.trim/implementation');
    import getPolyfill = require('string.prototype.trim/polyfill');
    import shim = require('string.prototype.trim/shim');


    type Prepend<E, T extends any[]> = ((receiver: E, ...args: T) => any) extends ((...args: infer U) => any)
        ? U
        : T;

    type CallBound<F extends (...args: any[]) => any> =
        F extends (this: infer T, ...args: infer A) => infer R
        ? (...args: Prepend<T, A>) => R
        : never;

    const ArrayPrototypeTrim: CallBound<typeof implementation> & {
        readonly getPolyfill: typeof getPolyfill;
        readonly implementation: typeof implementation;
        readonly shim: typeof shim;
    };
    export = ArrayPrototypeTrim;
}

declare module 'string.prototype.trim/implementation' {
    const trim: (this: string) => string;

    export = trim;
}

declare module 'string.prototype.trim/polyfill' {
    import trim = require('string.prototype.trim/implementation');

    function getPolyfill(): typeof trim;
    export = getPolyfill;
}

declare module 'string.prototype.trim/shim' {
    import trim = require('string.prototype.trim/implementation');

    function shimArrayPrototypeTrim(): typeof trim;
    export = shimArrayPrototypeTrim;
}

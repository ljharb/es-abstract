declare module 'string.prototype.trimstart' {
    // Type definitions for string.prototype.trimstart 1.0
    // Project: https://github.com/es-shims/Array.prototype.trimStart
    // Definitions by: Jordan Harband <https://github.com/ljharb>
    // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

    import implementation = require('string.prototype.trimstart/implementation');
    import getPolyfill = require('string.prototype.trimstart/polyfill');
    import shim = require('string.prototype.trimstart/shim');


    type Prepend<E, T extends any[]> = ((receiver: E, ...args: T) => any) extends ((...args: infer U) => any)
        ? U
        : T;

    type CallBound<F extends (...args: any[]) => any> =
        F extends (this: infer T, ...args: infer A) => infer R
        ? (...args: Prepend<T, A>) => R
        : never;

    const ArrayPrototypeTrimStart: CallBound<typeof implementation> & {
        readonly getPolyfill: typeof getPolyfill;
        readonly implementation: typeof implementation;
        readonly shim: typeof shim;
    };
    export = ArrayPrototypeTrimStart;
}

declare module 'string.prototype.trimstart/implementation' {
    const trimStart: (this: string) => string;

    export = trimStart;
}

declare module 'string.prototype.trimstart/polyfill' {
    import trimStart = require('string.prototype.trimstart/implementation');

    function getPolyfill(): typeof trimStart;
    export = getPolyfill;
}

declare module 'string.prototype.trimstart/shim' {
    import filter = require('string.prototype.trimstart/implementation');

    function shimArrayPrototypeTrimStart(): typeof filter;
    export = shimArrayPrototypeTrimStart;
}

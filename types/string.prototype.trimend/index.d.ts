declare module 'string.prototype.trimend' {
    // Type definitions for string.prototype.trimend 1.0
    // Project: https://github.com/es-shims/String.prototype.trimEnd
    // Definitions by: Jordan Harband <https://github.com/ljharb>
    // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

    import implementation = require('string.prototype.trimend/implementation');
    import getPolyfill = require('string.prototype.trimend/polyfill');
    import shim = require('string.prototype.trimend/shim');


    type Prepend<E, T extends any[]> = ((receiver: E, ...args: T) => any) extends ((...args: infer U) => any)
        ? U
        : T;

    type CallBound<F extends (...args: any[]) => any> =
        F extends (this: infer T, ...args: infer A) => infer R
        ? (...args: Prepend<T, A>) => R
        : never;

    const ArrayPrototypeTrimEnd: CallBound<typeof implementation> & {
        readonly getPolyfill: typeof getPolyfill;
        readonly implementation: typeof implementation;
        readonly shim: typeof shim;
    };
    export = ArrayPrototypeTrimEnd;
}

declare module 'string.prototype.trimend/implementation' {
    const trimEnd: (this: string) => string;

    export = trimEnd;
}

declare module 'string.prototype.trimend/polyfill' {
    import trimEnd = require('string.prototype.trimend/implementation');

    function getPolyfill(): typeof trimEnd;
    export = getPolyfill;
}

declare module 'string.prototype.trimend/shim' {
    import filter = require('string.prototype.trimend/implementation');

    function shimArrayPrototypeTrimEnd(): typeof filter;
    export = shimArrayPrototypeTrimEnd;
}

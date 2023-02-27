declare module 'function.prototype.name' {
    // Type definitions for function.prototype.name 1.0
    // Project: https://github.com/es-shims/Function.prototype.name
    // Definitions by: Jordan Harband <https://github.com/ljharb>
    // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

    import implementation = require('function.prototype.name/implementation');
    import getPolyfill = require('function.prototype.name/polyfill');
    import shim = require('function.prototype.name/shim');


    type Prepend<E, T extends any[]> = ((receiver: E, ...args: T) => any) extends ((...args: infer U) => any)
        ? U
        : T;

    type CallBound<F extends (...args: any[]) => any> =
        F extends (this: infer T, ...args: infer A) => infer R
        ? (...args: Prepend<T, A>) => R
        : never;

    const FunctionPrototypeName: CallBound<typeof implementation> & {
        readonly getPolyfill: typeof getPolyfill;
        readonly implementation: typeof implementation;
        readonly shim: typeof shim;
    };
    export = FunctionPrototypeName;
}

declare module 'function.prototype.name/implementation' {
    const name: (this: Function) => string;

    export = name;
}

declare module 'function.prototype.name/polyfill' {
    import name = require('function.prototype.name/implementation');

    function getPolyfill(): typeof name;
    export = getPolyfill;
}

declare module 'function.prototype.name/shim' {
    import filter = require('function.prototype.name/implementation');

    function shimFunctionPrototypeName(): typeof name;
    export = shimFunctionPrototypeName;
}
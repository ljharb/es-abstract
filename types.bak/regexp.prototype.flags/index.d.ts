declare module 'regexp.prototype.flags' {
    // Type definitions for regexp.prototype.flags 1.0
    // Project: https://github.com/es-shims/RegExp.prototype.flags
    // Definitions by: Jordan Harband <https://github.com/ljharb>
    // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

    import implementation = require('regexp.prototype.flags/implementation');
    import getPolyfill = require('regexp.prototype.flags/polyfill');
    import shim = require('regexp.prototype.flags/shim');


    type Prepend<E, T extends any[]> = ((receiver: E, ...args: T) => any) extends ((...args: infer U) => any)
        ? U
        : T;

    type CallBound<F extends (...args: any[]) => any> =
        F extends (this: infer T, ...args: infer A) => infer R
        ? (...args: Prepend<T, A>) => R
        : never;

    const RegExpPrototypeFlags: CallBound<typeof implementation> & {
        readonly getPolyfill: typeof getPolyfill;
        readonly implementation: typeof implementation;
        readonly shim: typeof shim;
    };
    export = RegExpPrototypeFlags;
}

declare module 'regexp.prototype.flags/implementation' {
    const FlagsGetter: (this: RegExp) => ('d' | 'g' | 'i' | 'm' | 's' | 'u' | 'v' | 'y')[];

    export = FlagsGetter;
}

declare module 'regexp.prototype.flags/polyfill' {
    import flags = require('regexp.prototype.flags/implementation');

    /** Gets the optimal implementation to use */
    function getPolyfill(): typeof flags;
    export = getPolyfill;
}

declare module 'regexp.prototype.flags/shim' {
    import flags = require('regexp.prototype.flags/implementation');

    function shimRegExpPrototypeFlags(): typeof flags;
    export = shimRegExpPrototypeFlags;
}
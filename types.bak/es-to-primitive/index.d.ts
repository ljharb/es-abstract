declare module 'es-to-primitive/es5' {
    function esToPrimitive(input: unknown, hint?: StringConstructor | NumberConstructor): string | number;
    export = esToPrimitive;
}

declare module 'es-to-primitive/es2015' {
    function esToPrimitive(input: unknown, hint?: StringConstructor | NumberConstructor) : null | undefined | boolean | string | number | symbol;
    export = esToPrimitive;
}

declare module 'es-to-primitive/es6' {
    import ES2015 = require('es-to-primitive/es2015');
    export = ES2015;
}

declare module 'es-to-primitive' {
    import ES5 from 'es-to-primitive/es5';
    import ES6 from 'es-to-primitive/es6';
    import ES2015 from 'es-to-primitive/es2015';
    type esToPrimitive = typeof ES6 & {
        ES5: typeof ES5;
        ES6: typeof ES6;
        ES2015: typeof ES2015;
    };
    export = esToPrimitive;
}
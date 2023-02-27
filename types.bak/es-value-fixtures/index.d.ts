declare module 'es-value-fixtures' {
    type coercibleFnObject = () => void;
    type coercibleObject = { toString: () => number; valueOf: () => number };
    type toStringOnlyObject = { valueOf: () => object, toString: () => number };
    type uncoercibleObject = { valueOf: () => object, toString: () => object };
    type uncoercibleFnObject = {
        valueOf: () => Function;
        toString: () => Function;
    };
    type valueOfOnlyObject = { valueOf: () => number, toString: () => object };

    type nullish = null | undefined;
    type nonNullishPrimitive = boolean | string | number | symbol | bigint;
    type primitive = nullish | nonNullishPrimitive;

    interface Fixtures {
        booleans: boolean[],
        coercibleFnObject: coercibleFnObject;
        coercibleObject: coercibleObject;
        falsies: [null, undefined, false, 0, '', typeof NaN, 0n];
        hasSymbols: boolean;
        infinities: number[],
        int32s: number[],
        integerNumbers: number[],
        nonArrays: unknown[],
        bigints: bigint[],
        nonBigInts: (nullish | boolean | string | number | symbol | object)[],
        nonBooleans: (nullish | string | number | symbol | bigint | object)[],
        nonFunctions: (primitive | unknown)[],
        arrowFunctions: Function[],
        generatorFunctions: Function[],
        asyncFunctions: Function[],
        nonConstructorFunctions: Function[],
        nonIntegerNumbers: number[],
        notNonNegativeIntegers: number[],
        nonNullPrimitives: nonNullishPrimitive[],
        nonNumberPrimitives: (nullish | string | symbol)[],
        nonNumbers: (nullish | string | symbol | object)[],
        nonPropertyKeys: (nullish | boolean | number | bigint | object)[],
        nonStrings: (nullish | boolean | number | symbol | bigint | object)[],
        nonSymbolPrimitives: (nullish | boolean | number | string | bigint | object)[],
        nonUndefinedPrimitives: (null | boolean | number | string | symbol | bigint | object)[],
        nullPrimitives: nullish[],
        numbers: number[],
        objects: object[],
        primitives: primitive[];
        propertyKeys: (symbol | string)[];
        strings: string[];
        symbols: symbol[];
        wellKnownSymbols: symbol[];
        timestamps: number[];
        toStringOnlyObject: toStringOnlyObject;
        truthies: [true, number, string, bigint, object, symbol];
        uncoercibleFnObject: uncoercibleFnObject;
        uncoercibleObject: uncoercibleObject;
        valueOfOnlyObject: valueOfOnlyObject;
        zeroes: [0, -0];
        bothDescriptor: () => { '[[Get]]': Function, '[[Value]]': boolean };
        bothDescriptorWritable: () => { '[[Get]]': Function, '[[Writable]]': true };
        accessorDescriptor: <T>(value?: T) => ({
            '[[Enumerable]]': true,
            '[[Configurable]]': true,
            '[[Get]]': () => T,
            '[[Set]]'?: (value?: unknown) => void
        });
        mutatorDescriptor: <T>() => {
            '[[Enumerable]]': true;
            '[[Configurable]]': true;
            '[[Get]]'?: () => T,
            '[[Set]]': (value?: T) => void;
        };
        dataDescriptor: <T = 42>(value?: T) => {
            '[[Configurable]]'?: boolean;
            '[[Enumerable]]'?: boolean;
            '[[Writable]]': false;
            '[[Value]]': T;
        };
        genericDescriptor: () => {
            '[[Configurable]]': true;
            '[[Enumerable]]': false;
        };
        assignedDescriptor: <T>(value?: T) => {
            '[[Configurable]]': true;
            '[[Enumerable]]': true;
            '[[Value]]': T;
            '[[Writable]]': true;
        };
        descriptors: {
            configurable: <T = object>(descriptor?: T) => T & { '[[Configurable]]': true };
            nonConfigurable: <T = object>(descriptor?: T) => T & { '[[Configurable]]': false };
            enumerable: <T = object>(descriptor?: T) => T & { '[[Enumerable]]': true };
            nonEnumerable: <T = object>(descriptor?: T) => T & { '[[Enumerable]]': false };
            writable: <T = object>(descriptor?: T) => T & { '[[Writable]]': true };
            nonWritable: <T = object>(descriptor?: T) => T & { '[[Writable]]': false };
        };
    }
    const FixturesObj: Fixtures;
    export = FixturesObj;
}

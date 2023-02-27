declare module 'which-typed-array' {
    function whichTypedArray<T>(obj: T):
        T extends Int8Array ? 'Int8Array'
        : T extends Uint8Array ? 'Uint8Array'
        : T extends Uint8ClampedArray ? 'Uint8ClampedArray'
        : T extends Int16Array ? 'Int16Array'
        : T extends Uint16Array ? 'Uint16Array'
        : T extends Int32Array ? 'Int32Array'
        : T extends Uint32Array ? 'Uint32Array'
        : T extends Float32Array ? 'Float32Array'
        : T extends Float64Array ? 'Float64Array'
        : T extends BigInt64Array ? 'BigInt64Array'
        : T extends BigUint64Array ? 'BigUint64Array'
        : false;

    export = whichTypedArray;
}

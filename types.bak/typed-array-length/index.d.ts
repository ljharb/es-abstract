declare module 'typed-array-length' {
    type TypedArray =
        | Int8Array
        | Uint8Array
        | Uint8ClampedArray
        | Int16Array
        | Uint16Array
        | Int32Array
        | Uint32Array
        | Float32Array
        | Float64Array;

    function typedArrayLength(ta: TypedArray): number;

    export = typedArrayLength;
}
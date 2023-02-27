declare module 'is-shared-array-buffer' {
    function isSharedArrayBuffer(x: unknown): x is SharedArrayBuffer;

    export = isSharedArrayBuffer;
}
declare module 'is-string' {
    function isString(x: unknown): x is string | String;
    export = isString;
}
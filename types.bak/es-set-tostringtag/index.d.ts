declare module 'es-set-tostringtag' {
    function setToStringTag(object: object, value: string, options?: { force: boolean }): void;

    export = setToStringTag;
}
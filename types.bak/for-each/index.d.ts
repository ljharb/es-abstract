declare module 'for-each' {
    function forEach<T>(array: T[], callback: (value: T, index: keyof T, array: T[]) => void): void;
    
    function forEach<T>(object: T, callback: (value: T[keyof T], key: keyof T, object: T) => void): void;

    export = forEach;
}
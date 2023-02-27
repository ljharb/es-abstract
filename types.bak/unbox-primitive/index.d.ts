declare module 'unbox-primitive' {
    function unboxPrimitive<T>(x: T): T extends string ? String : T extends number ? Number : T extends boolean ? Boolean : T extends symbol ? Symbol : never;
    export = unboxPrimitive;
}
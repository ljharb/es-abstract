declare module 'mock-property' {
    function MockProperty(
        obj: object,
        prop: string | symbol,
        options?: {
            nonEnumerable?: boolean,
            'delete'?: boolean
        } & ({
            nonWritable?: boolean,
            value?: unknown,
            get?: never,
            set?: never,
        } | {
            nonWritable?: never,
            value?: never,
            get?: Function,
            set?: Function
        }),
    ): () => void;
    
    export = MockProperty;
}
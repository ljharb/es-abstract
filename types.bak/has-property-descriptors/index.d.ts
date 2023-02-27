declare module 'has-property-descriptors' {
    function hasPropertyDescriptors(): boolean;

    const HasPropertyDescriptors: typeof hasPropertyDescriptors & {
        hasArrayLengthDefineBug: () => boolean | null;
    };

    export = HasPropertyDescriptors;
}
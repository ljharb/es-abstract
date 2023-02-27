declare module 'available-regexp-flags' {
    function availableRegexpFlags():
        | ['g', 'i', 'm']
        | ['g', 'i', 'm', 's', 'u', 'y']
        | ['d', 'g', 'i', 'm', 's', 'u', 'y']
        | ['d', 'g', 'i', 'm', 's', 'u', 'v', 'y'];
    export = availableRegexpFlags;
}

declare module 'available-regexp-flags/properties' {
    const props: {
        d: 'hasIndices',
        g: 'global',
        i: 'ignoreCase',
        m: 'multiline',
        s: 'dotAll',
        u: 'unicode',
        v: 'unicodeSets',
        y: 'sticky'
    };
    export = props;
}
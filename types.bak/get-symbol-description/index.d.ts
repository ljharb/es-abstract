declare module 'get-symbol-description' {
    function getSymbolDescription(symbol: symbol): string | undefined;

    export = getSymbolDescription;
}

declare module 'get-symbol-description/getInferredName' {
    function getInferredName(symbol: symbol): string | undefined;

    const GetInferredName: typeof getInferredName | null;

    export = GetInferredName;
}
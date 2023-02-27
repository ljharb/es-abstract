declare module 'functions-have-names' {
    function functionsHaveNames(): boolean;
    type FunctionsHaveNames = typeof functionsHaveNames & {
        functionsHaveConfigurableNames: () => boolean;
        boundFunctionsHaveNames: () => boolean;
    };
    export = FunctionsHaveNames;
}
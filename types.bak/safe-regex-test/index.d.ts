declare module 'safe-regex-test' {
    function safeRegexTest(regex: RegExp): (string: unknown) => boolean;

    export = safeRegexTest;
}
import tape from 'tape';

import type { ES } from '../types';

declare function tapeLike(name: string, opts: tape.TestOptions, cb: tape.TestCase): ReturnType<typeof tape>;
declare function tapeLike(name: string, cb: tape.TestCase): ReturnType<typeof tape>;
// declare function tapeLike(name: string, maybeOpts: tape.TestOptions | tape.TestCase, maybeCb: tape.TestCase | undefined): ReturnType<typeof tape>;

export type TapeLike = typeof tapeLike;

export type EditionTests<T extends ES> = (
	ES: T,
	ops: Record<keyof T, string | { url: string }>,
	expectedMissing: string[],
	skips?: Record<string, boolean>,
) => void;

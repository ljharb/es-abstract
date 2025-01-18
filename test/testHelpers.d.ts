import tape from 'tape';

import type { ES, ESByYear } from '../types';

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

import years from '../operations/years';

type TestYear = 5 | typeof years[number];

type ExpandUnion<T> = T extends infer U ? U : never;

type SplitAOName<AOName extends string> =
  AOName extends `${infer Outer}::${infer Inner}`
    ? [Outer, Inner]
    : [AOName];

// type YearsWithAO<AOName extends string, Years extends TestYear = TestYear> = ExpandUnion<
// 	Exclude<
// 		{
// 			[Y in Years]: AOName extends keyof ESByYear[Y] ? Y : never
// 		}[Years],
// 		never
// 	>
// >;

type YearsWithAO<
  AOName extends string,
  Years extends TestYear = TestYear
> = ExpandUnion<
  Exclude<
    {
      [Y in Years]:
        SplitAOName<AOName> extends [infer Outer, infer Inner]
          ? Outer extends keyof ESByYear[Y]
            ? Inner extends keyof ESByYear[Y][Outer]
              ? Y
              : never
            : never
          : // no `::`
            AOName extends keyof ESByYear[Y]
              ? Y
              : never;
    }[Years],
    never
  >
>;

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// type DistributeAO<AOName extends string> = YearsWithAO<AOName> extends infer Y
// 	? Y extends TestYear
// 		? AOName extends keyof ESByYear[Y]
// 			? NonNullable<Extract<ESByYear[Y][AOName], Function>>
// 			: never
// 		: never
// 	: never;

type DistributeAO<AOName extends string> =
  YearsWithAO<AOName> extends infer Y
    ? Y extends TestYear
      ? SplitAOName<AOName> extends [infer Outer, infer Inner]
        ? Outer extends keyof ESByYear[Y]
          ? Inner extends keyof ESByYear[Y][Outer]
            ? NonNullable<Extract<ESByYear[Y][Outer][Inner], Function>>
            : never
          : never
        : AOName extends keyof ESByYear[Y]
          ? NonNullable<Extract<ESByYear[Y][AOName], Function>>
          : never
      : never
    : never;

export type AOOnlyYears<AOName extends string, Years extends TestYear> = YearsWithAO<AOName, Years> extends infer Y
	? Y extends TestYear
		? AOName extends keyof ESByYear[Y]
			? NonNullable<Extract<ESByYear[Y][AOName], Function>>
			: never
		: never
	: never;

type AOUnion<AOName extends string> = DistributeAO<AOName>;

export type MethodTest<AOName extends string> = (
	t: tape.Test,
	year: ExpandUnion<YearsWithAO<AOName>>,
	AO: AOUnion<AOName>,
	getAO: <OtherAOName extends string>(aoName: OtherAOName) => ExpandUnion<AOUnion<OtherAOName>>
) => void;
/*
type KeysOfUnion<T> = T extends T ? keyof T: never;

export type MethodTest<F extends KeysOfUnion<ESbyYear[TestYear]>> = <Y extends TestYear>(
	t: tape.Test,
	year: Y,
	method: ESbyYear[Y][F],
	getAO?: <M extends keyof ESbyYear[Y]>(methodName: M) => ESbyYear[Y][M],
) => void;
*/

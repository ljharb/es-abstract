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

export type TestYear = 5 | typeof years[number];

type ExpandUnion<T> = T extends infer U ? U : never;

export type SplitAOName<AOName extends string> =
  AOName extends `${infer Outer}::${infer Inner}`
    ? [Outer, Inner]
    : [AOName];

type YearsWithAO<
  AOName extends string,
  Subset extends TestYear = TestYear
> = ExpandUnion<
  Exclude<
    {
      [Y in Subset]:
        SplitAOName<AOName> extends [infer Outer, infer Inner]
          ? // handle "Outer::Inner" case
            Outer extends keyof ESByYear[Y]
              ? Inner extends keyof ESByYear[Y][Outer]
                ? Y
                : never
              : never
          : // handle top-level "AOName" case
            AOName extends keyof ESByYear[Y]
              ? Y
              : never
    }[Subset],
    never
  >
>;

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type DistributeAO<
  AOName extends string,
  Subset extends TestYear = TestYear
> =
  YearsWithAO<AOName, Subset> extends infer Y
    ? Y extends TestYear
      ? SplitAOName<AOName> extends [infer Outer, infer Inner]
        ? Outer extends keyof ESByYear[Y]
          ? Inner extends keyof ESByYear[Y][Outer]
            ? NonNullable<Extract<ESByYear[Y][Outer][Inner], Function>>
            : never
          : never
        : // No "::"; top-level key
          AOName extends keyof ESByYear[Y]
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

type AOUnion<
  AOName extends string,
  Subset extends TestYear = TestYear
> = ExpandUnion<DistributeAO<AOName, Subset>>;


export type SubsetCallback<
	AOName extends string,
	Subset extends TestYear,
> = (ao: AOUnion<AOName, Subset>) => void;

export type MethodTest<AOName extends string, Subset extends TestYear = TestYear> = (
	t: tape.Test,
	year: ExpandUnion<YearsWithAO<AOName, Subset>>,
	AO: AOUnion<AOName, Subset>,
	extras: {
		getAO: <OtherAOName extends string>(aoName: OtherAOName) => ExpandUnion<AOUnion<OtherAOName, Subset>>,
		testSubset: <LocalAOName extends string, LocalYearSubset extends TestYear>(
			aoName: LocalAOName,
			year: TestYear,
			ao: AOUnion<AOName, Subset>,
			subset: readonly LocalYearSubset[],
			callback: (ao: ExpandUnion<AOUnion<LocalAOName, LocalYearSubset>>) => void,
		) => void,
	},
) => void;

type KeysOfUnion<T> = T extends T ? keyof T: never;

export type AOForYears<
  AOName extends string,
  Y extends TestYear
> = AOUnion<AOName, Extract<YearsWithAO<AOName>, Y>>;

type NestedFunctionKeys<Outer extends string, Obj> = {
  [K in keyof Obj]:
    NonNullable<Obj[K]> extends (...args: any) => any
      ? // E.g. "Number::toString"
        `${Outer}::${Extract<K, string>}`
      : never;
}[keyof Obj];

type AllAONamesForYear<Y extends TestYear> = {
  [K in keyof ESByYear[Y]]:
    // If it's a function, the AO name is K
    NonNullable<ESByYear[Y][K]> extends (...args: any) => any
      ? Extract<K, string>
    // If it's an object, gather the nested function keys
    : NonNullable<ESByYear[Y][K]> extends object
      ? NestedFunctionKeys<Extract<K, string>, NonNullable<ESByYear[Y][K]>>
    : never;
}[keyof ESByYear[Y]];

export type AllAONames = ExpandUnion<{
  [Y in TestYear]: AllAONamesForYear<Y>;
}[TestYear]>;

import type { Func, integer, primitive, PropertyKey } from '../types';

export type esSubset<T> = {
	IsArray(x: unknown): x is T[];
	AdvanceStringIndex(s: string, i: integer, unicode: true): integer;
	GetMethod<P extends PropertyKey>(
		O: Partial<Record<P, import('../types').Func | null | undefined>>,
		P: P
	): undefined | Func;
};

declare function getIteratorMethod<T>(ES: esSubset<T>, iterable: Partial<Iterable<T>>): undefined | (() => Iterator<T>);

export type GetIteratorMethod = typeof getIteratorMethod;
type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

export type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;

export type HexDigit = IntRange<0, 9> | 'a' | 'b' | 'c' | 'd' | 'e' | 'f';

export type nonNegativeInteger = number; // TODO IntRange<0, 9007199254740992>;

export type arrayLength = number; // TODO IntRange<0, 4294967295>;

export type integer = number;

export type es5Primitive = null | undefined | boolean | string | number;

export type primitive = es5Primitive | symbol | bigint;

export type NonNumeric = Exclude<primitive, number | bigint> | object;

type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
		[K in Keys]-?:
				Required<Pick<T, K>>
				& Partial<Record<Exclude<Keys, K>, undefined>>
}[Keys];

export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>
}[keyof T];

/* Descriptors */

type BaseDescriptor = Partial<{
  '[[Configurable]]': boolean;
  '[[Enumerable]]': boolean;
}>;
export type GenericDescriptor = BaseDescriptor & {
	'[[Value]]'?: never;
	'[[Writable]]'?: never;
	'[[Get]]'?: never;
	'[[Set]]'?: never;
};
type DataDescriptorOnly<T> = RequireAtLeastOne<{
  '[[Writable]]': boolean;
  '[[Value]]': T;
}>;
type AccessorDescriptorOnly<T> = RequireAtLeastOne<{
  '[[Get]]': () => T;
  '[[Set]]': (value: T) => void;
}>;

export type DataDescriptor<T> = BaseDescriptor & DataDescriptorOnly<T>;
export type AccessorDescriptor<T> = BaseDescriptor & AccessorDescriptorOnly<T>;
export type CompleteDescriptor<T> = Required<Descriptor<T>>;
export type Descriptor<T> = BaseDescriptor & Partial<AccessorDescriptorOnly<T> | DataDescriptorOnly<T>>;

/* end Descriptors */

/* Typed Arrays */

import type {
	TypedArray,
	TypedArrayName,
	TypedArrayConstructor,
} from 'which-typed-array';

export type {
	TypedArray,
	TypedArrayName,
	TypedArrayConstructor,
};

export type TypedArrayNameByInstance<T extends TypedArray> =
  T extends Int8Array ? 'Int8Array'
  : T extends Uint8Array ? 'Uint8Array'
  : T extends Uint8ClampedArray ? 'Uint8ClampedArray'
  : T extends Int16Array ? 'Int16Array'
  : T extends Uint16Array ? 'Uint16Array'
  : T extends Int32Array ? 'Int32Array'
  : T extends Uint32Array ? 'Uint32Array'
  : T extends BigInt64Array ? 'BigInt64Array'
  : T extends BigUint64Array ? 'BigUint64Array'
  : T extends Float32Array ? 'Float32Array'
  : T extends Float64Array ? 'Float64Array'
  : never;

export type TypedArrayTypeByName<T extends TypedArrayName> =
  T extends 'Int8Array' ? 'Int8'
  : T extends 'Uint8Array' ? 'Uint8'
  : T extends 'Uint8ClampedArray' ? 'Uint8C'
  : T extends 'Int16Array' ? 'Int16'
  : T extends 'Uint16Array' ? 'Uint16'
  : T extends 'Int32Array' ? 'Int32'
  : T extends 'Uint32Array' ? 'Uint32'
  : T extends 'BigInt64Array' ? 'BigInt64'
  : T extends 'BigUint64Array' ? 'BigUint64'
  : T extends 'Float32Array' ? 'Float32'
  : T extends 'Float64Array' ? 'Float64'
  : never;

export type TypedArrayByName<T extends TypedArrayName> = (
  T extends 'Int8Array' ? Int8ArrayConstructor
  : T extends 'Uint8Array' ? Uint8ArrayConstructor
  : T extends 'Uint8ClampedArray' ? Uint8ClampedArrayConstructor
  : T extends 'Int16Array' ? Int16ArrayConstructor
  : T extends 'Uint16Array' ? Uint16ArrayConstructor
  : T extends 'Int32Array' ? Int32ArrayConstructor
  : T extends 'Uint32Array' ? Uint32ArrayConstructor
  : T extends 'BigInt64Array' ? BigInt64ArrayConstructor
  : T extends 'BigUint64Array' ? BigUint64ArrayConstructor
  : T extends 'Float32Array' ? Float32ArrayConstructor
  : T extends 'Float64Array' ? Float64ArrayConstructor
  : T extends unknown ? never
  : TypedArrayConstructor
);

export type TypedArrayWithBufferWitnessRecord = {
  '[[Object]]': TypedArray;
  '[[CachedBufferByteLength]]': integer | 'DETACHED';
};

/* end Typed Arrays */

export type CompletionRecordType = 'normal' | 'break' | 'continue' | 'return' | 'throw';

export type MatchRecord = { '[[StartIndex]]': nonNegativeInteger; '[[EndIndex]]': nonNegativeInteger };

export type IteratorRecord<T> = { '[[Iterator]]': Iterator<T>; '[[NextMethod]]': (value?: unknown) => IteratorResult<T, typeof value>, '[[Done]]': boolean };
export type IteratorRecord2023<T> = Omit<IteratorRecord<T>, '[[NextMethod]]'> & { '[[NextMethod]]': (value?: unknown) => IteratorResult<T, typeof value> };
export type AsyncIteratorRecord<T> = { '[[Iterator]]': AsyncIterator<T>; '[[NextMethod]]': () => Promise<IteratorResult<T>>, '[[Done]]': boolean };

export type AsyncGeneratorRequestRecord<T> = {
  '[[Completion]]': object;
  '[[Capability]]': PromiseCapabilityRecord<T>;
};

/* Promises */
export type PromiseType<T> = T extends Promise<infer U> ? U : never;

export type PromiseExecutor = ConstructorParameters<PromiseConstructor>[0];
type ResolveFunction = Parameters<PromiseExecutor>[0];
type RejectFunction = Parameters<PromiseExecutor>[1];
export type PromiseCapabilityRecord<T> = {
  __proto__: null,
  '[[Resolve]]': ResolveFunction,
  '[[Reject]]': RejectFunction,
  '[[Promise]]': Promise<T>,
};

export type PromiseConstructorLike<T> = Constructor<Promise<T>, PromiseConstructor>;
/* end Promises */

export type DataViewWithBufferWitnessRecord = {
  '[[Object]]': DataView;
  '[[CachedBufferByteLength]]': integer | 'DETACHED';
};

export type RegExpRecord = {
  '[[CapturingGroupsCount]]': integer;
  '[[DotAll]]': boolean;
  '[[IgnoreCase]]': boolean;
  '[[Multiline]]': boolean;
  '[[Unicode]]': boolean;
	'[[UnicodeSets]]'?: boolean;
};

export type BasicConstructor = abstract new (...args: any) => any;

export type Constructor<Instance, C extends BasicConstructor> = (new (...args: ConstructorParameters<C>) => Instance) & {
	prototype: object | null;
	[Symbol.species]?: Constructor<Instance, C>;
	[Symbol.hasInstance]?: (instance: unknown) => instance is Instance;
};

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ByteValue = IntRange<0, 256>;

export type InferIterableType<T> = T extends Iterable<infer U> ? U : never;
export type InferIteratorType<T> = T extends Iterator<infer U> ? U : never;
export type ArrayLikeType<T> = T extends ArrayLike<infer U> ? U : never;

export type ES = Record<PropertyKey, unknown> & (
	| typeof import('./es5')
	| typeof import('./es2015')
	| typeof import('./es2016')
	| typeof import('./es2017')
	| typeof import('./es2018')
	| typeof import('./es2019')
	| typeof import('./es2020')
	| typeof import('./es2021')
	| typeof import('./es2022')
	| typeof import('./es2023')
	| typeof import('./es2024')
);

declare function toString(argument: symbol): never;
declare function toString(argument: null | undefined | boolean | string | number | bigint | object): string;
declare function toString(argument: unknown): string;

export type ToString = typeof toString;

export type PropertyKey = string | symbol;

export type PredicateType<T> = T extends (x: any) => x is infer U ? U : never;

export type WithoutPrefix<T extends string, prefix extends string> = T extends `${prefix}${infer Rest}` ? Rest : never;

declare function BinaryNumericFn(x: number, y: number): number;
declare function BinaryNumericFn(x: bigint, y: bigint): bigint;

export type BinaryNumeric = typeof BinaryNumericFn;

export type Func = (...args: any[]) => any;

export type GettableFrom<T> = T extends { __proto__: infer U } ? Exclude<keyof T, '__proto__'> | GettableFrom<U> : keyof T;

type GetIndexedField<T, K> = K extends keyof T
  ? T[K]
  : K extends `${number}`
    ? '0' extends keyof T
      ? undefined
      : number extends keyof T
        ? T[number]
        : undefined
    : undefined

type FieldWithPossiblyUndefined<T, Key> =
  | GetFieldType<Exclude<T, undefined>, Key>
  | Extract<T, undefined>

type IndexedFieldWithPossiblyUndefined<T, Key> =
  | GetIndexedField<Exclude<T, undefined>, Key>
  | Extract<T, undefined>

export type GetFieldType<T, P> = P extends `${infer Left}.${infer Right}`
  ? Left extends keyof T
    ? FieldWithPossiblyUndefined<T[Left], Right>
    : Left extends `${infer FieldKey}[${infer IndexKey}]`
      ? FieldKey extends keyof T
        ? FieldWithPossiblyUndefined<IndexedFieldWithPossiblyUndefined<T[FieldKey], IndexKey>, Right>
        : undefined
      : undefined
  : P extends keyof T
    ? T[P]
    : P extends `${infer FieldKey}[${infer IndexKey}]`
      ? FieldKey extends keyof T
        ? IndexedFieldWithPossiblyUndefined<T[FieldKey], IndexKey>
        : undefined
      : undefined

// declare function get<TData, TPath extends string>(data: TData, path: TPath): GetFieldType<TData, TPath> | unknown;

export type ProtoResolved<T extends object | null> = T extends { __proto__: infer R extends object | null } ? T & ProtoResolved<R> : T;

type GettableAttributes<T extends object | null> = Exclude<keyof ProtoResolved<T>, '__proto__'>;

declare function get<T extends object, K extends GettableAttributes<T> & PropertyKey>(O: T, P: K): ProtoResolved<T>[K];

export type Get = typeof get;

declare function getV<T extends {}, K extends GettableAttributes<T> & PropertyKey>(O: T, P: K): ProtoResolved<T>[K];

export type GetV = typeof getV;

export type InternalSlot = `[[${string}]]`;

export type UnicodeEscapeChar = `\\u${HexDigit}${HexDigit}${HexDigit}${HexDigit}`;

declare function compareTypedArrayElements(x: number, y: number, compareFn: (x: number, y: number) => number | undefined): number;
declare function compareTypedArrayElements(x: bigint, y: bigint, compareFn: (x: bigint, y: bigint) => bigint | undefined): bigint;

export type CompareTypedArrayElements = typeof compareTypedArrayElements;

declare function floor(x: number): integer;
declare function floor(x: bigint): bigint;

export type Floor = typeof floor;

declare function fromPropertyDescriptor<T>(Desc: undefined): undefined;
declare function fromPropertyDescriptor<T>(Desc: Descriptor<T>): PropertyDescriptor;
declare function fromPropertyDescriptor<T>(Desc: undefined | Descriptor<T>): PropertyDescriptor;

export type FromPropertyDescriptor = typeof fromPropertyDescriptor;

declare function bytesAsInteger(rawBytes: ByteValue[], elementSize: integer, isUnsigned: boolean, isBigInt: false): number;
declare function bytesAsInteger(rawBytes: ByteValue[], elementSize: integer, isUnsigned: boolean, isBigInt: true): bigint;
declare function bytesAsInteger(rawBytes: ByteValue[], elementSize: integer, isUnsigned: boolean, isBigInt: boolean): number | bigint;

export type BytesAsInteger = typeof bytesAsInteger;

declare function enumerableOwnPropertyNames<V, O extends Record<string, V>>(O: O, kind: 'key'): (keyof O)[];
declare function enumerableOwnPropertyNames<V, O extends Record<string, V>>(O: O, kind: 'value'): V[];
declare function enumerableOwnPropertyNames<V, O extends Record<string, V>>(O: O, kind: 'key+value'): [keyof O, V];
declare function enumerableOwnPropertyNames<V, O extends Record<string, V>>(O: O, kind: never): [keyof O, V] | V[] | (keyof O)[];

export type EnumerableOwnPropertyNames = typeof enumerableOwnPropertyNames;

declare function ordinaryDefineOwnProperty<U, T extends PropertyKey>(O: Record<T, U>, P: T, Desc: Partial<Descriptor<U>>): boolean;
declare function ordinaryDefineOwnProperty<U, T extends PropertyKey>(O: U[], P: number, Desc: Partial<Descriptor<U>>): boolean;
declare function ordinaryDefineOwnProperty<U, T extends PropertyKey>(O: Record<T, U> | U[], P: T, Desc: Partial<Descriptor<U>>): boolean;

export type OrdinaryDefineOwnProperty = typeof ordinaryDefineOwnProperty;

declare function setTypedArrayFromArrayLike(target: TypedArray, targetOffset: integer, source: ArrayLike<bigint>): void;
declare function setTypedArrayFromArrayLike(target: TypedArray, targetOffset: integer, source: ArrayLike<number>): void;

export type SetTypedArrayFromArrayLike = typeof setTypedArrayFromArrayLike;

declare function validateAndApplyPropertyDescriptor<V, T extends Record<PropertyKey, V> | undefined>(
	O: T,
	P: PropertyKey,
	extensible: boolean,
	Desc: Descriptor<V>,
	current: undefined | Descriptor<V>
): boolean;

declare function validateAndApplyPropertyDescriptor<V, T extends Record<PropertyKey, V> | undefined>(
	O: undefined,
	P: PropertyKey | undefined,
	extensible: boolean,
	Desc: Descriptor<V>,
	current: undefined | Descriptor<V>
): boolean

export type ValidateAndApplyPropertyDescriptor = typeof validateAndApplyPropertyDescriptor;

declare function isConcatSpreadable(O: primitive): false;
declare function isConcatSpreadable(O: { [Symbol.isConcatSpreadable]?: unknown }): boolean;
declare function isConcatSpreadable(O: unknown[] & { [Symbol.isConcatSpreadable]?: unknown }): boolean;

export type IsConcatSpreadable = typeof isConcatSpreadable;

declare function deletePropertyOrThrow<O>(
	O: O & Func,
	P: 'name' | 'length' | keyof O,
): true;
declare function deletePropertyOrThrow<O>(
	O: O & unknown[],
	P: 'length' | number,
): true;
declare function deletePropertyOrThrow<O>(
	O: O & object,
	P: keyof O,
): true;

export type DeletePropertyOrThrow = typeof deletePropertyOrThrow;

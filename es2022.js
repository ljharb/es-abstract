'use strict';

/* eslint global-require: 0 */
// https://262.ecma-international.org/13.0/#sec-abstract-operations
var ES2022 = {
	abs: require('./2022/abs'),
	AddEntriesFromIterable: require('./2022/AddEntriesFromIterable'),
	AddToKeptObjects: require('./2022/AddToKeptObjects'),
	AdvanceStringIndex: require('./2022/AdvanceStringIndex'),
	ApplyStringOrNumericBinaryOperator: require('./2022/ApplyStringOrNumericBinaryOperator'),
	ArrayCreate: require('./2022/ArrayCreate'),
	ArraySetLength: require('./2022/ArraySetLength'),
	ArraySpeciesCreate: require('./2022/ArraySpeciesCreate'),
	AsyncFromSyncIteratorContinuation: require('./2022/AsyncFromSyncIteratorContinuation'),
	AsyncIteratorClose: require('./2022/AsyncIteratorClose'),
	BigInt: require('./2022/BigInt'),
	BigIntBitwiseOp: require('./2022/BigIntBitwiseOp'),
	BinaryAnd: require('./2022/BinaryAnd'),
	BinaryOr: require('./2022/BinaryOr'),
	BinaryXor: require('./2022/BinaryXor'),
	ByteListBitwiseOp: require('./2022/ByteListBitwiseOp'),
	ByteListEqual: require('./2022/ByteListEqual'),
	Call: require('./2022/Call'),
	Canonicalize: require('./2022/Canonicalize'),
	CanonicalNumericIndexString: require('./2022/CanonicalNumericIndexString'),
	CharacterRange: require('./2022/CharacterRange'),
	clamp: require('./2022/clamp'),
	ClearKeptObjects: require('./2022/ClearKeptObjects'),
	CloneArrayBuffer: require('./2022/CloneArrayBuffer'),
	CodePointAt: require('./2022/CodePointAt'),
	CodePointsToString: require('./2022/CodePointsToString'),
	CompletePropertyDescriptor: require('./2022/CompletePropertyDescriptor'),
	CompletionRecord: require('./2022/CompletionRecord'),
	CopyDataProperties: require('./2022/CopyDataProperties'),
	CreateAsyncFromSyncIterator: require('./2022/CreateAsyncFromSyncIterator'),
	CreateDataProperty: require('./2022/CreateDataProperty'),
	CreateDataPropertyOrThrow: require('./2022/CreateDataPropertyOrThrow'),
	CreateHTML: require('./2022/CreateHTML'),
	CreateIterResultObject: require('./2022/CreateIterResultObject'),
	CreateListFromArrayLike: require('./2022/CreateListFromArrayLike'),
	CreateMethodProperty: require('./2022/CreateMethodProperty'),
	CreateNonEnumerableDataPropertyOrThrow: require('./2022/CreateNonEnumerableDataPropertyOrThrow'),
	CreateRegExpStringIterator: require('./2022/CreateRegExpStringIterator'),
	DateFromTime: require('./2022/DateFromTime'),
	DateString: require('./2022/DateString'),
	Day: require('./2022/Day'),
	DayFromYear: require('./2022/DayFromYear'),
	DaysInYear: require('./2022/DaysInYear'),
	DayWithinYear: require('./2022/DayWithinYear'),
	DefineMethodProperty: require('./2022/DefineMethodProperty'),
	DefinePropertyOrThrow: require('./2022/DefinePropertyOrThrow'),
	DeletePropertyOrThrow: require('./2022/DeletePropertyOrThrow'),
	DetachArrayBuffer: require('./2022/DetachArrayBuffer'),
	EnumerableOwnPropertyNames: require('./2022/EnumerableOwnPropertyNames'),
	FlattenIntoArray: require('./2022/FlattenIntoArray'),
	floor: require('./2022/floor'),
	FromPropertyDescriptor: require('./2022/FromPropertyDescriptor'),
	Get: require('./2022/Get'),
	GetGlobalObject: require('./2022/GetGlobalObject'),
	GetIterator: require('./2022/GetIterator'),
	GetMatchIndexPair: require('./2022/GetMatchIndexPair'),
	GetMatchString: require('./2022/GetMatchString'),
	GetMethod: require('./2022/GetMethod'),
	GetOwnPropertyKeys: require('./2022/GetOwnPropertyKeys'),
	GetPromiseResolve: require('./2022/GetPromiseResolve'),
	GetPrototypeFromConstructor: require('./2022/GetPrototypeFromConstructor'),
	GetStringIndex: require('./2022/GetStringIndex'),
	GetSubstitution: require('./2022/GetSubstitution'),
	GetV: require('./2022/GetV'),
	GetValueFromBuffer: require('./2022/GetValueFromBuffer'),
	HasOwnProperty: require('./2022/HasOwnProperty'),
	HasProperty: require('./2022/HasProperty'),
	HourFromTime: require('./2022/HourFromTime'),
	InLeapYear: require('./2022/InLeapYear'),
	InstallErrorCause: require('./2022/InstallErrorCause'),
	InstanceofOperator: require('./2022/InstanceofOperator'),
	IntegerIndexedElementGet: require('./2022/IntegerIndexedElementGet'),
	IntegerIndexedElementSet: require('./2022/IntegerIndexedElementSet'),
	Invoke: require('./2022/Invoke'),
	IsAccessorDescriptor: require('./2022/IsAccessorDescriptor'),
	IsArray: require('./2022/IsArray'),
	IsBigIntElementType: require('./2022/IsBigIntElementType'),
	IsCallable: require('./2022/IsCallable'),
	IsCompatiblePropertyDescriptor: require('./2022/IsCompatiblePropertyDescriptor'),
	IsConcatSpreadable: require('./2022/IsConcatSpreadable'),
	IsConstructor: require('./2022/IsConstructor'),
	IsDataDescriptor: require('./2022/IsDataDescriptor'),
	IsDetachedBuffer: require('./2022/IsDetachedBuffer'),
	IsExtensible: require('./2022/IsExtensible'),
	IsGenericDescriptor: require('./2022/IsGenericDescriptor'),
	IsIntegralNumber: require('./2022/IsIntegralNumber'),
	IsLessThan: require('./2022/IsLessThan'),
	IsLooselyEqual: require('./2022/IsLooselyEqual'),
	IsNoTearConfiguration: require('./2022/IsNoTearConfiguration'),
	IsPromise: require('./2022/IsPromise'),
	IsPropertyKey: require('./2022/IsPropertyKey'),
	IsRegExp: require('./2022/IsRegExp'),
	IsSharedArrayBuffer: require('./2022/IsSharedArrayBuffer'),
	IsStrictlyEqual: require('./2022/IsStrictlyEqual'),
	IsStringPrefix: require('./2022/IsStringPrefix'),
	IsStringWellFormedUnicode: require('./2022/IsStringWellFormedUnicode'),
	IsUnclampedIntegerElementType: require('./2022/IsUnclampedIntegerElementType'),
	IsUnsignedElementType: require('./2022/IsUnsignedElementType'),
	IsValidIntegerIndex: require('./2022/IsValidIntegerIndex'),
	IsWordChar: require('./2022/IsWordChar'),
	IterableToList: require('./2022/IterableToList'),
	IteratorClose: require('./2022/IteratorClose'),
	IteratorComplete: require('./2022/IteratorComplete'),
	IteratorNext: require('./2022/IteratorNext'),
	IteratorStep: require('./2022/IteratorStep'),
	IteratorValue: require('./2022/IteratorValue'),
	LengthOfArrayLike: require('./2022/LengthOfArrayLike'),
	MakeDate: require('./2022/MakeDate'),
	MakeDay: require('./2022/MakeDay'),
	MakeMatchIndicesIndexPairArray: require('./2022/MakeMatchIndicesIndexPairArray'),
	MakeTime: require('./2022/MakeTime'),
	max: require('./2022/max'),
	min: require('./2022/min'),
	MinFromTime: require('./2022/MinFromTime'),
	modulo: require('./2022/modulo'),
	MonthFromTime: require('./2022/MonthFromTime'),
	msFromTime: require('./2022/msFromTime'),
	NewPromiseCapability: require('./2022/NewPromiseCapability'),
	NormalCompletion: require('./2022/NormalCompletion'),
	Number: require('./2022/Number'),
	NumberBitwiseOp: require('./2022/NumberBitwiseOp'),
	NumberToBigInt: require('./2022/NumberToBigInt'),
	NumericToRawBytes: require('./2022/NumericToRawBytes'),
	ObjectDefineProperties: require('./2022/ObjectDefineProperties'),
	OrdinaryCreateFromConstructor: require('./2022/OrdinaryCreateFromConstructor'),
	OrdinaryDefineOwnProperty: require('./2022/OrdinaryDefineOwnProperty'),
	OrdinaryGetOwnProperty: require('./2022/OrdinaryGetOwnProperty'),
	OrdinaryGetPrototypeOf: require('./2022/OrdinaryGetPrototypeOf'),
	OrdinaryHasInstance: require('./2022/OrdinaryHasInstance'),
	OrdinaryHasProperty: require('./2022/OrdinaryHasProperty'),
	OrdinaryObjectCreate: require('./2022/OrdinaryObjectCreate'),
	OrdinarySetPrototypeOf: require('./2022/OrdinarySetPrototypeOf'),
	OrdinaryToPrimitive: require('./2022/OrdinaryToPrimitive'),
	PromiseResolve: require('./2022/PromiseResolve'),
	QuoteJSONString: require('./2022/QuoteJSONString'),
	RawBytesToNumeric: require('./2022/RawBytesToNumeric'),
	RegExpCreate: require('./2022/RegExpCreate'),
	RegExpExec: require('./2022/RegExpExec'),
	RegExpHasFlag: require('./2022/RegExpHasFlag'),
	RequireObjectCoercible: require('./2022/RequireObjectCoercible'),
	SameValue: require('./2022/SameValue'),
	SameValueNonNumeric: require('./2022/SameValueNonNumeric'),
	SameValueZero: require('./2022/SameValueZero'),
	SecFromTime: require('./2022/SecFromTime'),
	Set: require('./2022/Set'),
	SetFunctionLength: require('./2022/SetFunctionLength'),
	SetFunctionName: require('./2022/SetFunctionName'),
	SetIntegrityLevel: require('./2022/SetIntegrityLevel'),
	SetTypedArrayFromArrayLike: require('./2022/SetTypedArrayFromArrayLike'),
	SetTypedArrayFromTypedArray: require('./2022/SetTypedArrayFromTypedArray'),
	SetValueInBuffer: require('./2022/SetValueInBuffer'),
	SortIndexedProperties: require('./2022/SortIndexedProperties'),
	SpeciesConstructor: require('./2022/SpeciesConstructor'),
	StringCreate: require('./2022/StringCreate'),
	StringGetOwnProperty: require('./2022/StringGetOwnProperty'),
	StringIndexOf: require('./2022/StringIndexOf'),
	StringPad: require('./2022/StringPad'),
	StringToBigInt: require('./2022/StringToBigInt'),
	StringToCodePoints: require('./2022/StringToCodePoints'),
	StringToNumber: require('./2022/StringToNumber'),
	substring: require('./2022/substring'),
	SymbolDescriptiveString: require('./2022/SymbolDescriptiveString'),
	TestIntegrityLevel: require('./2022/TestIntegrityLevel'),
	thisBigIntValue: require('./2022/thisBigIntValue'),
	thisBooleanValue: require('./2022/thisBooleanValue'),
	thisNumberValue: require('./2022/thisNumberValue'),
	thisStringValue: require('./2022/thisStringValue'),
	thisSymbolValue: require('./2022/thisSymbolValue'),
	thisTimeValue: require('./2022/thisTimeValue'),
	ThrowCompletion: require('./2022/ThrowCompletion'),
	TimeClip: require('./2022/TimeClip'),
	TimeFromYear: require('./2022/TimeFromYear'),
	TimeString: require('./2022/TimeString'),
	TimeWithinDay: require('./2022/TimeWithinDay'),
	TimeZoneString: require('./2022/TimeZoneString'),
	ToBigInt: require('./2022/ToBigInt'),
	ToBigInt64: require('./2022/ToBigInt64'),
	ToBigUint64: require('./2022/ToBigUint64'),
	ToBoolean: require('./2022/ToBoolean'),
	ToDateString: require('./2022/ToDateString'),
	ToIndex: require('./2022/ToIndex'),
	ToInt16: require('./2022/ToInt16'),
	ToInt32: require('./2022/ToInt32'),
	ToInt8: require('./2022/ToInt8'),
	ToIntegerOrInfinity: require('./2022/ToIntegerOrInfinity'),
	ToLength: require('./2022/ToLength'),
	ToNumber: require('./2022/ToNumber'),
	ToNumeric: require('./2022/ToNumeric'),
	ToObject: require('./2022/ToObject'),
	ToPrimitive: require('./2022/ToPrimitive'),
	ToPropertyDescriptor: require('./2022/ToPropertyDescriptor'),
	ToPropertyKey: require('./2022/ToPropertyKey'),
	ToString: require('./2022/ToString'),
	ToUint16: require('./2022/ToUint16'),
	ToUint32: require('./2022/ToUint32'),
	ToUint8: require('./2022/ToUint8'),
	ToUint8Clamp: require('./2022/ToUint8Clamp'),
	ToZeroPaddedDecimalString: require('./2022/ToZeroPaddedDecimalString'),
	TrimString: require('./2022/TrimString'),
	Type: require('./2022/Type'),
	TypedArrayCreate: require('./2022/TypedArrayCreate'),
	TypedArrayElementSize: require('./2022/TypedArrayElementSize'),
	TypedArrayElementType: require('./2022/TypedArrayElementType'),
	TypedArraySpeciesCreate: require('./2022/TypedArraySpeciesCreate'),
	UnicodeEscape: require('./2022/UnicodeEscape'),
	UTF16EncodeCodePoint: require('./2022/UTF16EncodeCodePoint'),
	UTF16SurrogatePairToCodePoint: require('./2022/UTF16SurrogatePairToCodePoint'),
	ValidateAndApplyPropertyDescriptor: require('./2022/ValidateAndApplyPropertyDescriptor'),
	ValidateAtomicAccess: require('./2022/ValidateAtomicAccess'),
	ValidateIntegerTypedArray: require('./2022/ValidateIntegerTypedArray'),
	ValidateTypedArray: require('./2022/ValidateTypedArray'),
	WeakRefDeref: require('./2022/WeakRefDeref'),
	WeekDay: require('./2022/WeekDay'),
	WordCharacters: require('./2022/WordCharacters'),
	YearFromTime: require('./2022/YearFromTime')
};

module.exports = ES2022;

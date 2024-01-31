'use strict';

/* eslint global-require: 0 */
// https://262.ecma-international.org/14.0/#sec-abstract-operations
var ES2023 = {
	abs: require('./2023/abs'),
	AddEntriesFromIterable: require('./2023/AddEntriesFromIterable'),
	AddToKeptObjects: require('./2023/AddToKeptObjects'),
	AdvanceStringIndex: require('./2023/AdvanceStringIndex'),
	ApplyStringOrNumericBinaryOperator: require('./2023/ApplyStringOrNumericBinaryOperator'),
	ArrayCreate: require('./2023/ArrayCreate'),
	ArraySetLength: require('./2023/ArraySetLength'),
	ArraySpeciesCreate: require('./2023/ArraySpeciesCreate'),
	AsyncFromSyncIteratorContinuation: require('./2023/AsyncFromSyncIteratorContinuation'),
	AsyncIteratorClose: require('./2023/AsyncIteratorClose'),
	BigInt: require('./2023/BigInt'),
	BigIntBitwiseOp: require('./2023/BigIntBitwiseOp'),
	BinaryAnd: require('./2023/BinaryAnd'),
	BinaryOr: require('./2023/BinaryOr'),
	BinaryXor: require('./2023/BinaryXor'),
	ByteListBitwiseOp: require('./2023/ByteListBitwiseOp'),
	ByteListEqual: require('./2023/ByteListEqual'),
	Call: require('./2023/Call'),
	CanBeHeldWeakly: require('./2023/CanBeHeldWeakly'),
	Canonicalize: require('./2023/Canonicalize'),
	CanonicalNumericIndexString: require('./2023/CanonicalNumericIndexString'),
	CharacterRange: require('./2023/CharacterRange'),
	clamp: require('./2023/clamp'),
	ClearKeptObjects: require('./2023/ClearKeptObjects'),
	CloneArrayBuffer: require('./2023/CloneArrayBuffer'),
	CodePointAt: require('./2023/CodePointAt'),
	CodePointsToString: require('./2023/CodePointsToString'),
	CompareArrayElements: require('./2023/CompareArrayElements'),
	CompareTypedArrayElements: require('./2023/CompareTypedArrayElements'),
	CompletePropertyDescriptor: require('./2023/CompletePropertyDescriptor'),
	CompletionRecord: require('./2023/CompletionRecord'),
	CopyDataProperties: require('./2023/CopyDataProperties'),
	CreateAsyncFromSyncIterator: require('./2023/CreateAsyncFromSyncIterator'),
	CreateDataProperty: require('./2023/CreateDataProperty'),
	CreateDataPropertyOrThrow: require('./2023/CreateDataPropertyOrThrow'),
	CreateHTML: require('./2023/CreateHTML'),
	CreateIterResultObject: require('./2023/CreateIterResultObject'),
	CreateListFromArrayLike: require('./2023/CreateListFromArrayLike'),
	CreateMethodProperty: require('./2023/CreateMethodProperty'),
	CreateNonEnumerableDataPropertyOrThrow: require('./2023/CreateNonEnumerableDataPropertyOrThrow'),
	CreateRegExpStringIterator: require('./2023/CreateRegExpStringIterator'),
	DateFromTime: require('./2023/DateFromTime'),
	DateString: require('./2023/DateString'),
	Day: require('./2023/Day'),
	DayFromYear: require('./2023/DayFromYear'),
	DaysInYear: require('./2023/DaysInYear'),
	DayWithinYear: require('./2023/DayWithinYear'),
	DefinePropertyOrThrow: require('./2023/DefinePropertyOrThrow'),
	DeletePropertyOrThrow: require('./2023/DeletePropertyOrThrow'),
	DetachArrayBuffer: require('./2023/DetachArrayBuffer'),
	EnumerableOwnProperties: require('./2023/EnumerableOwnProperties'),
	FindViaPredicate: require('./2023/FindViaPredicate'),
	FlattenIntoArray: require('./2023/FlattenIntoArray'),
	floor: require('./2023/floor'),
	FromPropertyDescriptor: require('./2023/FromPropertyDescriptor'),
	Get: require('./2023/Get'),
	GetGlobalObject: require('./2023/GetGlobalObject'),
	GetIterator: require('./2023/GetIterator'),
	GetIteratorFromMethod: require('./2023/GetIteratorFromMethod'),
	GetMatchIndexPair: require('./2023/GetMatchIndexPair'),
	GetMatchString: require('./2023/GetMatchString'),
	GetMethod: require('./2023/GetMethod'),
	GetOwnPropertyKeys: require('./2023/GetOwnPropertyKeys'),
	GetPromiseResolve: require('./2023/GetPromiseResolve'),
	GetPrototypeFromConstructor: require('./2023/GetPrototypeFromConstructor'),
	GetStringIndex: require('./2023/GetStringIndex'),
	GetSubstitution: require('./2023/GetSubstitution'),
	GetV: require('./2023/GetV'),
	GetValueFromBuffer: require('./2023/GetValueFromBuffer'),
	HasOwnProperty: require('./2023/HasOwnProperty'),
	HasProperty: require('./2023/HasProperty'),
	HourFromTime: require('./2023/HourFromTime'),
	InLeapYear: require('./2023/InLeapYear'),
	InstallErrorCause: require('./2023/InstallErrorCause'),
	InstanceofOperator: require('./2023/InstanceofOperator'),
	IntegerIndexedElementGet: require('./2023/IntegerIndexedElementGet'),
	IntegerIndexedElementSet: require('./2023/IntegerIndexedElementSet'),
	Invoke: require('./2023/Invoke'),
	IsAccessorDescriptor: require('./2023/IsAccessorDescriptor'),
	IsArray: require('./2023/IsArray'),
	IsBigIntElementType: require('./2023/IsBigIntElementType'),
	IsCallable: require('./2023/IsCallable'),
	IsCompatiblePropertyDescriptor: require('./2023/IsCompatiblePropertyDescriptor'),
	IsConcatSpreadable: require('./2023/IsConcatSpreadable'),
	IsConstructor: require('./2023/IsConstructor'),
	IsDataDescriptor: require('./2023/IsDataDescriptor'),
	IsDetachedBuffer: require('./2023/IsDetachedBuffer'),
	IsExtensible: require('./2023/IsExtensible'),
	IsGenericDescriptor: require('./2023/IsGenericDescriptor'),
	IsIntegralNumber: require('./2023/IsIntegralNumber'),
	IsLessThan: require('./2023/IsLessThan'),
	IsLooselyEqual: require('./2023/IsLooselyEqual'),
	IsNoTearConfiguration: require('./2023/IsNoTearConfiguration'),
	IsPromise: require('./2023/IsPromise'),
	IsPropertyKey: require('./2023/IsPropertyKey'),
	IsRegExp: require('./2023/IsRegExp'),
	IsSharedArrayBuffer: require('./2023/IsSharedArrayBuffer'),
	IsStrictlyEqual: require('./2023/IsStrictlyEqual'),
	IsStringWellFormedUnicode: require('./2023/IsStringWellFormedUnicode'),
	IsUnclampedIntegerElementType: require('./2023/IsUnclampedIntegerElementType'),
	IsUnsignedElementType: require('./2023/IsUnsignedElementType'),
	IsValidIntegerIndex: require('./2023/IsValidIntegerIndex'),
	IsWordChar: require('./2023/IsWordChar'),
	IteratorClose: require('./2023/IteratorClose'),
	IteratorComplete: require('./2023/IteratorComplete'),
	IteratorNext: require('./2023/IteratorNext'),
	IteratorStep: require('./2023/IteratorStep'),
	IteratorToList: require('./2023/IteratorToList'),
	IteratorValue: require('./2023/IteratorValue'),
	KeyForSymbol: require('./2023/KeyForSymbol'),
	LengthOfArrayLike: require('./2023/LengthOfArrayLike'),
	MakeDate: require('./2023/MakeDate'),
	MakeDay: require('./2023/MakeDay'),
	MakeMatchIndicesIndexPairArray: require('./2023/MakeMatchIndicesIndexPairArray'),
	MakeTime: require('./2023/MakeTime'),
	max: require('./2023/max'),
	min: require('./2023/min'),
	MinFromTime: require('./2023/MinFromTime'),
	modulo: require('./2023/modulo'),
	MonthFromTime: require('./2023/MonthFromTime'),
	msFromTime: require('./2023/msFromTime'),
	NewPromiseCapability: require('./2023/NewPromiseCapability'),
	NormalCompletion: require('./2023/NormalCompletion'),
	Number: require('./2023/Number'),
	NumberBitwiseOp: require('./2023/NumberBitwiseOp'),
	NumberToBigInt: require('./2023/NumberToBigInt'),
	NumericToRawBytes: require('./2023/NumericToRawBytes'),
	ObjectDefineProperties: require('./2023/ObjectDefineProperties'),
	OrdinaryCreateFromConstructor: require('./2023/OrdinaryCreateFromConstructor'),
	OrdinaryDefineOwnProperty: require('./2023/OrdinaryDefineOwnProperty'),
	OrdinaryGetOwnProperty: require('./2023/OrdinaryGetOwnProperty'),
	OrdinaryGetPrototypeOf: require('./2023/OrdinaryGetPrototypeOf'),
	OrdinaryHasInstance: require('./2023/OrdinaryHasInstance'),
	OrdinaryHasProperty: require('./2023/OrdinaryHasProperty'),
	OrdinaryObjectCreate: require('./2023/OrdinaryObjectCreate'),
	OrdinarySetPrototypeOf: require('./2023/OrdinarySetPrototypeOf'),
	OrdinaryToPrimitive: require('./2023/OrdinaryToPrimitive'),
	ParseHexOctet: require('./2023/ParseHexOctet'),
	PromiseResolve: require('./2023/PromiseResolve'),
	QuoteJSONString: require('./2023/QuoteJSONString'),
	RawBytesToNumeric: require('./2023/RawBytesToNumeric'),
	RegExpCreate: require('./2023/RegExpCreate'),
	RegExpExec: require('./2023/RegExpExec'),
	RegExpHasFlag: require('./2023/RegExpHasFlag'),
	RequireObjectCoercible: require('./2023/RequireObjectCoercible'),
	SameValue: require('./2023/SameValue'),
	SameValueNonNumber: require('./2023/SameValueNonNumber'),
	SameValueZero: require('./2023/SameValueZero'),
	SecFromTime: require('./2023/SecFromTime'),
	Set: require('./2023/Set'),
	SetFunctionLength: require('./2023/SetFunctionLength'),
	SetFunctionName: require('./2023/SetFunctionName'),
	SetIntegrityLevel: require('./2023/SetIntegrityLevel'),
	SetTypedArrayFromArrayLike: require('./2023/SetTypedArrayFromArrayLike'),
	SetTypedArrayFromTypedArray: require('./2023/SetTypedArrayFromTypedArray'),
	SetValueInBuffer: require('./2023/SetValueInBuffer'),
	SortIndexedProperties: require('./2023/SortIndexedProperties'),
	SpeciesConstructor: require('./2023/SpeciesConstructor'),
	StringCreate: require('./2023/StringCreate'),
	StringGetOwnProperty: require('./2023/StringGetOwnProperty'),
	StringIndexOf: require('./2023/StringIndexOf'),
	StringPad: require('./2023/StringPad'),
	StringToBigInt: require('./2023/StringToBigInt'),
	StringToCodePoints: require('./2023/StringToCodePoints'),
	StringToNumber: require('./2023/StringToNumber'),
	substring: require('./2023/substring'),
	SymbolDescriptiveString: require('./2023/SymbolDescriptiveString'),
	TestIntegrityLevel: require('./2023/TestIntegrityLevel'),
	thisBigIntValue: require('./2023/thisBigIntValue'),
	thisBooleanValue: require('./2023/thisBooleanValue'),
	thisNumberValue: require('./2023/thisNumberValue'),
	thisStringValue: require('./2023/thisStringValue'),
	thisSymbolValue: require('./2023/thisSymbolValue'),
	thisTimeValue: require('./2023/thisTimeValue'),
	ThrowCompletion: require('./2023/ThrowCompletion'),
	TimeClip: require('./2023/TimeClip'),
	TimeFromYear: require('./2023/TimeFromYear'),
	TimeString: require('./2023/TimeString'),
	TimeWithinDay: require('./2023/TimeWithinDay'),
	TimeZoneString: require('./2023/TimeZoneString'),
	ToBigInt: require('./2023/ToBigInt'),
	ToBigInt64: require('./2023/ToBigInt64'),
	ToBigUint64: require('./2023/ToBigUint64'),
	ToBoolean: require('./2023/ToBoolean'),
	ToDateString: require('./2023/ToDateString'),
	ToIndex: require('./2023/ToIndex'),
	ToInt16: require('./2023/ToInt16'),
	ToInt32: require('./2023/ToInt32'),
	ToInt8: require('./2023/ToInt8'),
	ToIntegerOrInfinity: require('./2023/ToIntegerOrInfinity'),
	ToLength: require('./2023/ToLength'),
	ToNumber: require('./2023/ToNumber'),
	ToNumeric: require('./2023/ToNumeric'),
	ToObject: require('./2023/ToObject'),
	ToPrimitive: require('./2023/ToPrimitive'),
	ToPropertyDescriptor: require('./2023/ToPropertyDescriptor'),
	ToPropertyKey: require('./2023/ToPropertyKey'),
	ToString: require('./2023/ToString'),
	ToUint16: require('./2023/ToUint16'),
	ToUint32: require('./2023/ToUint32'),
	ToUint8: require('./2023/ToUint8'),
	ToUint8Clamp: require('./2023/ToUint8Clamp'),
	ToZeroPaddedDecimalString: require('./2023/ToZeroPaddedDecimalString'),
	TrimString: require('./2023/TrimString'),
	truncate: require('./2023/truncate'),
	Type: require('./2023/Type'),
	TypedArrayCreate: require('./2023/TypedArrayCreate'),
	TypedArrayCreateSameType: require('./2023/TypedArrayCreateSameType'),
	TypedArrayElementSize: require('./2023/TypedArrayElementSize'),
	TypedArrayElementType: require('./2023/TypedArrayElementType'),
	TypedArraySpeciesCreate: require('./2023/TypedArraySpeciesCreate'),
	UnicodeEscape: require('./2023/UnicodeEscape'),
	UTF16EncodeCodePoint: require('./2023/UTF16EncodeCodePoint'),
	UTF16SurrogatePairToCodePoint: require('./2023/UTF16SurrogatePairToCodePoint'),
	ValidateAndApplyPropertyDescriptor: require('./2023/ValidateAndApplyPropertyDescriptor'),
	ValidateAtomicAccess: require('./2023/ValidateAtomicAccess'),
	ValidateIntegerTypedArray: require('./2023/ValidateIntegerTypedArray'),
	ValidateTypedArray: require('./2023/ValidateTypedArray'),
	WeakRefDeref: require('./2023/WeakRefDeref'),
	WeekDay: require('./2023/WeekDay'),
	WordCharacters: require('./2023/WordCharacters'),
	YearFromTime: require('./2023/YearFromTime')
};

module.exports = ES2023;

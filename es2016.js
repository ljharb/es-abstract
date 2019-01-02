'use strict';

/* eslint global-require: 0 */
// https://262.ecma-international.org/7.0/#sec-abstract-operations
var ES2016 = {
	'Abstract Equality Comparison': require('./2016/AbstractEqualityComparison'),
	'Abstract Relational Comparison': require('./2016/AbstractRelationalComparison'),
	'Strict Equality Comparison': require('./2016/StrictEqualityComparison'),
	abs: require('./2016/abs'),
	AdvanceStringIndex: require('./2016/AdvanceStringIndex'),
	ArrayCreate: require('./2016/ArrayCreate'),
	ArraySetLength: require('./2016/ArraySetLength'),
	ArraySpeciesCreate: require('./2016/ArraySpeciesCreate'),
	Call: require('./2016/Call'),
	Canonicalize: require('./2016/Canonicalize'),
	CanonicalNumericIndexString: require('./2016/CanonicalNumericIndexString'),
	CharacterRange: require('./2016/CharacterRange'),
	CompletePropertyDescriptor: require('./2016/CompletePropertyDescriptor'),
	CompletionRecord: require('./2016/CompletionRecord'),
	CreateDataProperty: require('./2016/CreateDataProperty'),
	CreateDataPropertyOrThrow: require('./2016/CreateDataPropertyOrThrow'),
	CreateHTML: require('./2016/CreateHTML'),
	CreateIterResultObject: require('./2016/CreateIterResultObject'),
	CreateListFromArrayLike: require('./2016/CreateListFromArrayLike'),
	CreateMethodProperty: require('./2016/CreateMethodProperty'),
	DateFromTime: require('./2016/DateFromTime'),
	Day: require('./2016/Day'),
	DayFromYear: require('./2016/DayFromYear'),
	DaysInYear: require('./2016/DaysInYear'),
	DayWithinYear: require('./2016/DayWithinYear'),
	DefinePropertyOrThrow: require('./2016/DefinePropertyOrThrow'),
	DeletePropertyOrThrow: require('./2016/DeletePropertyOrThrow'),
	DetachArrayBuffer: require('./2016/DetachArrayBuffer'),
	EnumerableOwnNames: require('./2016/EnumerableOwnNames'),
	floor: require('./2016/floor'),
	FromPropertyDescriptor: require('./2016/FromPropertyDescriptor'),
	Get: require('./2016/Get'),
	GetGlobalObject: require('./2016/GetGlobalObject'),
	GetIterator: require('./2016/GetIterator'),
	GetMethod: require('./2016/GetMethod'),
	GetOwnPropertyKeys: require('./2016/GetOwnPropertyKeys'),
	GetPrototypeFromConstructor: require('./2016/GetPrototypeFromConstructor'),
	GetSubstitution: require('./2016/GetSubstitution'),
	GetV: require('./2016/GetV'),
	HasOwnProperty: require('./2016/HasOwnProperty'),
	HasProperty: require('./2016/HasProperty'),
	HourFromTime: require('./2016/HourFromTime'),
	InLeapYear: require('./2016/InLeapYear'),
	InstanceofOperator: require('./2016/InstanceofOperator'),
	Invoke: require('./2016/Invoke'),
	IsAccessorDescriptor: require('./2016/IsAccessorDescriptor'),
	IsArray: require('./2016/IsArray'),
	IsCallable: require('./2016/IsCallable'),
	IsCompatiblePropertyDescriptor: require('./2016/IsCompatiblePropertyDescriptor'),
	IsConcatSpreadable: require('./2016/IsConcatSpreadable'),
	IsConstructor: require('./2016/IsConstructor'),
	IsDataDescriptor: require('./2016/IsDataDescriptor'),
	IsDetachedBuffer: require('./2016/IsDetachedBuffer'),
	IsExtensible: require('./2016/IsExtensible'),
	IsGenericDescriptor: require('./2016/IsGenericDescriptor'),
	IsInteger: require('./2016/IsInteger'),
	IsPromise: require('./2016/IsPromise'),
	IsPropertyKey: require('./2016/IsPropertyKey'),
	IsRegExp: require('./2016/IsRegExp'),
	IsWordChar: require('./2016/IsWordChar'),
	IterableToArrayLike: require('./2016/IterableToArrayLike'),
	IteratorClose: require('./2016/IteratorClose'),
	IteratorComplete: require('./2016/IteratorComplete'),
	IteratorNext: require('./2016/IteratorNext'),
	IteratorStep: require('./2016/IteratorStep'),
	IteratorValue: require('./2016/IteratorValue'),
	MakeDate: require('./2016/MakeDate'),
	MakeDay: require('./2016/MakeDay'),
	MakeTime: require('./2016/MakeTime'),
	max: require('./2016/max'),
	min: require('./2016/min'),
	MinFromTime: require('./2016/MinFromTime'),
	modulo: require('./2016/modulo'),
	MonthFromTime: require('./2016/MonthFromTime'),
	msFromTime: require('./2016/msFromTime'),
	NormalCompletion: require('./2016/NormalCompletion'),
	ObjectCreate: require('./2016/ObjectCreate'),
	ObjectDefineProperties: require('./2016/ObjectDefineProperties'),
	OrdinaryCreateFromConstructor: require('./2016/OrdinaryCreateFromConstructor'),
	OrdinaryDefineOwnProperty: require('./2016/OrdinaryDefineOwnProperty'),
	OrdinaryGetOwnProperty: require('./2016/OrdinaryGetOwnProperty'),
	OrdinaryGetPrototypeOf: require('./2016/OrdinaryGetPrototypeOf'),
	OrdinaryHasInstance: require('./2016/OrdinaryHasInstance'),
	OrdinaryHasProperty: require('./2016/OrdinaryHasProperty'),
	OrdinarySetPrototypeOf: require('./2016/OrdinarySetPrototypeOf'),
	QuoteJSONString: require('./2016/QuoteJSONString'),
	RegExpCreate: require('./2016/RegExpCreate'),
	RegExpExec: require('./2016/RegExpExec'),
	RequireObjectCoercible: require('./2016/RequireObjectCoercible'),
	SameValue: require('./2016/SameValue'),
	SameValueNonNumber: require('./2016/SameValueNonNumber'),
	SameValueZero: require('./2016/SameValueZero'),
	SecFromTime: require('./2016/SecFromTime'),
	Set: require('./2016/Set'),
	SetFunctionName: require('./2016/SetFunctionName'),
	SetIntegrityLevel: require('./2016/SetIntegrityLevel'),
	SpeciesConstructor: require('./2016/SpeciesConstructor'),
	SplitMatch: require('./2016/SplitMatch'),
	StringCreate: require('./2016/StringCreate'),
	SymbolDescriptiveString: require('./2016/SymbolDescriptiveString'),
	TestIntegrityLevel: require('./2016/TestIntegrityLevel'),
	thisBooleanValue: require('./2016/thisBooleanValue'),
	thisNumberValue: require('./2016/thisNumberValue'),
	thisStringValue: require('./2016/thisStringValue'),
	thisTimeValue: require('./2016/thisTimeValue'),
	TimeClip: require('./2016/TimeClip'),
	TimeFromYear: require('./2016/TimeFromYear'),
	TimeWithinDay: require('./2016/TimeWithinDay'),
	ToBoolean: require('./2016/ToBoolean'),
	ToDateString: require('./2016/ToDateString'),
	ToInt16: require('./2016/ToInt16'),
	ToInt32: require('./2016/ToInt32'),
	ToInt8: require('./2016/ToInt8'),
	ToInteger: require('./2016/ToInteger'),
	ToLength: require('./2016/ToLength'),
	ToNumber: require('./2016/ToNumber'),
	ToObject: require('./2016/ToObject'),
	ToPrimitive: require('./2016/ToPrimitive'),
	ToPropertyDescriptor: require('./2016/ToPropertyDescriptor'),
	ToPropertyKey: require('./2016/ToPropertyKey'),
	ToString: require('./2016/ToString'),
	ToUint16: require('./2016/ToUint16'),
	ToUint32: require('./2016/ToUint32'),
	ToUint8: require('./2016/ToUint8'),
	ToUint8Clamp: require('./2016/ToUint8Clamp'),
	Type: require('./2016/Type'),
	TypedArrayCreate: require('./2016/TypedArrayCreate'),
	TypedArraySpeciesCreate: require('./2016/TypedArraySpeciesCreate'),
	UTF16Decode: require('./2016/UTF16Decode'),
	UTF16Encoding: require('./2016/UTF16Encoding'),
	ValidateAndApplyPropertyDescriptor: require('./2016/ValidateAndApplyPropertyDescriptor'),
	ValidateTypedArray: require('./2016/ValidateTypedArray'),
	WeekDay: require('./2016/WeekDay'),
	YearFromTime: require('./2016/YearFromTime')
};

module.exports = ES2016;

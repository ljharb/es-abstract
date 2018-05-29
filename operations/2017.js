'use strict';

/*
egrep -o 'aoid="([^"]*)"' spec.html | sort | uniq | sed -E 's/aoid="(.*)"/\1/' | pbcopy

Abstract Equality Comparison
Abstract Relational Comparison
AddRestrictedFunctionProperties
AddWaiter
AdvanceStringIndex
AgentCanSuspend
AgentSignifier
AllocateArrayBuffer
AllocateSharedArrayBuffer
AllocateTypedArray
AllocateTypedArrayBuffer
ArrayCreate
ArraySetLength
ArraySpeciesCreate
AsyncFunctionAwait
AsyncFunctionCreate
AsyncFunctionStart
AtomicLoad
AtomicReadModifyWrite
BlockDeclarationInstantiation
BoundFunctionCreate
Call
CanonicalNumericIndexString
Canonicalize
CharacterRange
CharacterRangeOrUnion
CharacterSetMatcher
CloneArrayBuffer
CompletePropertyDescriptor
Completion
ComposeWriteEventBytes
Construct
CopyDataBlockBytes
CreateArrayFromList
CreateArrayIterator
CreateBuiltinFunction
CreateByteDataBlock
CreateDataProperty
CreateDataPropertyOrThrow
CreateDynamicFunction
CreateHTML
CreateIntrinsics
CreateIterResultObject
CreateListFromArrayLike
CreateListIterator
CreateMapIterator
CreateMappedArgumentsObject
CreateMethodProperty
CreatePerIterationEnvironment
CreateRealm
CreateResolvingFunctions
CreateSetIterator
CreateSharedByteDataBlock
CreateStringIterator
CreateUnmappedArgumentsObject
DateFromTime
Day
DayFromYear
DayWithinYear
DaysInYear
Decode
DefinePropertyOrThrow
DeletePropertyOrThrow
DetachArrayBuffer
Encode
EnqueueJob
EnterCriticalSection
EnumerableOwnProperties
EnumerateObjectProperties
EscapeRegExpPattern
EvalDeclarationInstantiation
EvaluateCall
EvaluateDirectCall
EvaluateNew
EventSet
ForBodyEvaluation
ForIn/OfBodyEvaluation
ForIn/OfHeadEvaluation
FromPropertyDescriptor
FulfillPromise
FunctionAllocate
FunctionCreate
FunctionDeclarationInstantiation
FunctionInitialize
GeneratorFunctionCreate
GeneratorResume
GeneratorResumeAbrupt
GeneratorStart
GeneratorValidate
GeneratorYield
Get
GetActiveScriptOrModule
GetBase
GetFunctionRealm
GetGlobalObject
GetIdentifierReference
GetIterator
GetMethod
GetModifySetValueInBuffer
GetModuleNamespace
GetNewTarget
GetOwnPropertyKeys
GetPrototypeFromConstructor
GetReferencedName
GetSubstitution
GetSuperConstructor
GetTemplateObject
GetThisEnvironment
GetThisValue
GetV
GetValue
GetValueFromBuffer
GetViewValue
GetWaiterList
GlobalDeclarationInstantiation
HasOwnProperty
HasPrimitiveBase
HasProperty
HostEnsureCanCompileStrings
HostEventSet
HostPromiseRejectionTracker
HostReportErrors
HostResolveImportedModule
HourFromTime
HoursPerDay
IfAbruptRejectPromise
ImportedLocalNames
InLeapYear
InitializeBoundName
InitializeHostDefinedRealm
InitializeReferencedBinding
InstanceofOperator
IntegerIndexedElementGet
IntegerIndexedElementSet
IntegerIndexedObjectCreate
InternalizeJSONProperty
Invoke
IsAccessorDescriptor
IsAnonymousFunctionDefinition
IsArray
IsCallable
IsCompatiblePropertyDescriptor
IsConcatSpreadable
IsConstructor
IsDataDescriptor
IsDetachedBuffer
IsExtensible
IsGenericDescriptor
IsInTailPosition
IsInteger
IsLabelledFunction
IsPromise
IsPropertyKey
IsPropertyReference
IsRegExp
IsSharedArrayBuffer
IsStrictReference
IsSuperReference
IsUnresolvableReference
IsWordChar
IterableToList
IteratorClose
IteratorComplete
IteratorNext
IteratorStep
IteratorValue
LeaveCriticalSection
LocalTime
LoopContinues
MakeArgGetter
MakeArgSetter
MakeClassConstructor
MakeConstructor
MakeDate
MakeDay
MakeMethod
MakeSuperPropertyReference
MakeTime
MinFromTime
MinutesPerHour
ModuleNamespaceCreate
MonthFromTime
NewDeclarativeEnvironment
NewFunctionEnvironment
NewGlobalEnvironment
NewModuleEnvironment
NewObjectEnvironment
NewPromiseCapability
NormalCompletion
NumberToRawBytes
ObjectCreate
ObjectDefineProperties
OrdinaryCallBindThis
OrdinaryCallEvaluateBody
OrdinaryCreateFromConstructor
OrdinaryDefineOwnProperty
OrdinaryDelete
OrdinaryGet
OrdinaryGetOwnProperty
OrdinaryGetPrototypeOf
OrdinaryHasInstance
OrdinaryHasProperty
OrdinaryIsExtensible
OrdinaryOwnPropertyKeys
OrdinaryPreventExtensions
OrdinarySet
OrdinarySetPrototypeOf
OrdinaryToPrimitive
ParseModule
ParseScript
PerformEval
PerformPromiseAll
PerformPromiseRace
PerformPromiseThen
PrepareForOrdinaryCall
PrepareForTailCall
PromiseReactionJob
PromiseResolveThenableJob
ProxyCreate
PutValue
QuoteJSONString
RawBytesToNumber
RegExpAlloc
RegExpBuiltinExec
RegExpCreate
RegExpExec
RegExpInitialize
RejectPromise
RemoveWaiter
RemoveWaiters
RepeatMatcher
RequireObjectCoercible
ResolveBinding
ResolveThisBinding
ReturnIfAbrupt
RunJobs
SameValue
SameValueNonNumber
SameValueZero
ScriptEvaluation
ScriptEvaluationJob
SecFromTime
SecondsPerMinute
SerializeJSONArray
SerializeJSONObject
SerializeJSONProperty
Set
SetDefaultGlobalBindings
SetFunctionName
SetImmutablePrototype
SetIntegrityLevel
SetRealmGlobalObject
SetValueInBuffer
SetViewValue
SharedDataBlockEventSet
SortCompare
SpeciesConstructor
SplitMatch
Strict Equality Comparison
StringCreate
StringGetOwnProperty
Suspend
SymbolDescriptiveString
TestIntegrityLevel
TimeClip
TimeFromYear
TimeWithinDay
ToBoolean
ToDateString
ToIndex
ToInt16
ToInt32
ToInt8
ToInteger
ToLength
ToNumber
ToObject
ToPrimitive
ToPropertyDescriptor
ToPropertyKey
ToString Applied to the Number Type
ToString
ToUint16
ToUint32
ToUint8
ToUint8Clamp
TopLevelModuleEvaluationJob
TriggerPromiseReactions
Type
TypedArrayCreate
TypedArraySpeciesCreate
UTC
UTF16Decode
UTF16Encoding
UpdateEmpty
ValidateAndApplyPropertyDescriptor
ValidateAtomicAccess
ValidateSharedIntegerTypedArray
ValidateTypedArray
ValueOfReadEvent
WakeWaiter
WeekDay
WordCharacters
YearFromTime
abs
agent-order
floor
happens-before
host-synchronizes-with
max
memory-order
min
modulo
msFromTime
msPerDay
msPerHour
msPerMinute
msPerSecond
reads-bytes-from
reads-from
synchronizes-with
thisBooleanValue
thisNumberValue
thisStringValue
thisTimeValue
*/

module.exports = {
	IsPropertyDescriptor: 'https://ecma-international.org/ecma-262/8.0/#sec-property-descriptor-specification-type',
	IsAccessorDescriptor: 'https://ecma-international.org/ecma-262/8.0/#sec-isaccessordescriptor',
	IsDataDescriptor: 'https://ecma-international.org/ecma-262/8.0/#sec-isdatadescriptor',
	IsGenericDescriptor: 'https://ecma-international.org/ecma-262/8.0/#sec-isgenericdescriptor',
	FromPropertyDescriptor: 'https://ecma-international.org/ecma-262/8.0/#sec-frompropertydescriptor',
	ToPropertyDescriptor: 'https://ecma-international.org/ecma-262/8.0/#sec-topropertydescriptor',
	CompletePropertyDescriptor: 'https://ecma-international.org/ecma-262/8.0/#sec-completepropertydescriptor',
	ToPrimitive: 'https://ecma-international.org/ecma-262/8.0/#sec-toprimitive',
	ToBoolean: 'https://ecma-international.org/ecma-262/8.0/#sec-toboolean',
	ToNumber: 'https://ecma-international.org/ecma-262/8.0/#sec-tonumber',
	ToInteger: 'https://ecma-international.org/ecma-262/8.0/#sec-tointeger',
	ToInt32: 'https://ecma-international.org/ecma-262/8.0/#sec-toint32',
	ToUint32: 'https://ecma-international.org/ecma-262/8.0/#sec-touint32',
	ToInt16: 'https://ecma-international.org/ecma-262/8.0/#sec-toint16',
	ToUint16: 'https://ecma-international.org/ecma-262/8.0/#sec-touint16',
	ToInt8: 'https://ecma-international.org/ecma-262/8.0/#sec-toint8',
	ToUint8: 'https://ecma-international.org/ecma-262/8.0/#sec-touint8',
	ToUint8Clamp: 'https://ecma-international.org/ecma-262/8.0/#sec-touint8clamp',
	ToString: 'https://ecma-international.org/ecma-262/8.0/#sec-tostring',
	ToObject: 'https://ecma-international.org/ecma-262/8.0/#sec-toobject',
	ToPropertyKey: 'https://ecma-international.org/ecma-262/8.0/#sec-topropertykey',
	ToLength: 'https://ecma-international.org/ecma-262/8.0/#sec-tolength',
	CanonicalNumericIndexString: 'https://ecma-international.org/ecma-262/8.0/#sec-canonicalnumericindexstring',
	ToIndex: 'https://ecma-international.org/ecma-262/8.0/#sec-toindex',
	RequireObjectCoercible: 'https://ecma-international.org/ecma-262/8.0/#sec-requireobjectcoercible',
	IsArray: 'https://ecma-international.org/ecma-262/8.0/#sec-isarray',
	IsCallable: 'https://ecma-international.org/ecma-262/8.0/#sec-iscallable',
	IsConstructor: 'https://ecma-international.org/ecma-262/8.0/#sec-isconstructor',
	IsExtensible: 'https://ecma-international.org/ecma-262/8.0/#sec-isextensible-o',
	IsInteger: 'https://ecma-international.org/ecma-262/8.0/#sec-isinteger',
	IsPropertyKey: 'https://ecma-international.org/ecma-262/8.0/#sec-ispropertykey',
	IsRegExp: 'https://ecma-international.org/ecma-262/8.0/#sec-isregexp',
	SameValue: 'https://ecma-international.org/ecma-262/8.0/#sec-samevalue',
	SameValueZero: 'https://ecma-international.org/ecma-262/8.0/#sec-samevaluezero',
	SameValueNonNumber: 'https://ecma-international.org/ecma-262/8.0/#sec-samevaluenonnumber',
	Get: 'https://ecma-international.org/ecma-262/8.0/#sec-get-o-p',
	GetV: 'https://ecma-international.org/ecma-262/8.0/#sec-getv',
	Set: 'https://ecma-international.org/ecma-262/8.0/#sec-set-o-p-v-throw',
	CreateDataProperty: 'https://ecma-international.org/ecma-262/8.0/#sec-createdataproperty',
	CreateMethodProperty: 'https://ecma-international.org/ecma-262/8.0/#sec-createmethodproperty',
	CreateDataPropertyOrThrow: 'https://ecma-international.org/ecma-262/8.0/#sec-createdatapropertyorthrow',
	DefinePropertyOrThrow: 'https://ecma-international.org/ecma-262/8.0/#sec-definepropertyorthrow',
	DeletePropertyOrThrow: 'https://ecma-international.org/ecma-262/8.0/#sec-deletepropertyorthrow',
	GetMethod: 'https://ecma-international.org/ecma-262/8.0/#sec-getmethod',
	HasProperty: 'https://ecma-international.org/ecma-262/8.0/#sec-hasproperty',
	HasOwnProperty: 'https://ecma-international.org/ecma-262/8.0/#sec-hasownproperty',
	Call: 'https://ecma-international.org/ecma-262/8.0/#sec-call',
	Construct: 'https://ecma-international.org/ecma-262/8.0/#sec-construct',
	SetIntegrityLevel: 'https://ecma-international.org/ecma-262/8.0/#sec-setintegritylevel',
	TestIntegrityLevel: 'https://ecma-international.org/ecma-262/8.0/#sec-testintegritylevel',
	CreateArrayFromList: 'https://ecma-international.org/ecma-262/8.0/#sec-createarrayfromlist',
	CreateListFromArrayLike: 'https://ecma-international.org/ecma-262/8.0/#sec-createlistfromarraylike',
	Invoke: 'https://ecma-international.org/ecma-262/8.0/#sec-invoke',
	OrdinaryHasInstance: 'https://ecma-international.org/ecma-262/8.0/#sec-ordinaryhasinstance',
	SpeciesConstructor: 'https://ecma-international.org/ecma-262/8.0/#sec-speciesconstructor',
	EnumerableOwnProperties: 'https://ecma-international.org/ecma-262/8.0/#sec-enumerableownproperties',
	GetIterator: 'https://ecma-international.org/ecma-262/8.0/#sec-getiterator',
	IteratorNext: 'https://ecma-international.org/ecma-262/8.0/#sec-iteratornext',
	IteratorComplete: 'https://ecma-international.org/ecma-262/8.0/#sec-iteratorcomplete',
	IteratorValue: 'https://ecma-international.org/ecma-262/8.0/#sec-iteratorvalue',
	IteratorStep: 'https://ecma-international.org/ecma-262/8.0/#sec-iteratorstep',
	IteratorClose: 'https://ecma-international.org/ecma-262/8.0/#sec-iteratorclose',
	CreateIterResultObject: 'https://ecma-international.org/ecma-262/8.0/#sec-createiterresultobject',
	CreateListIterator: 'https://ecma-international.org/ecma-262/8.0/#sec-createlistiterator',
	Type: 'https://ecma-international.org/ecma-262/8.0/#sec-ecmascript-language-types',
	thisNumberValue: 'https://ecma-international.org/ecma-262/8.0/#sec-properties-of-the-number-prototype-object',
	thisTimeValue: 'https://ecma-international.org/ecma-262/8.0/#sec-properties-of-the-date-prototype-object',
	thisStringValue: 'https://ecma-international.org/ecma-262/8.0/#sec-properties-of-the-string-prototype-object',
	thisBooleanValue: 'https://ecma-international.org/ecma-262/8.0/#sec-properties-of-the-boolean-constructor',
	RegExpExec: 'https://ecma-international.org/ecma-262/8.0/#sec-regexpexec',
	RegExpBuiltinExec: 'https://ecma-international.org/ecma-262/8.0/#sec-regexpbuiltinexec',
	IsConcatSpreadable: 'https://ecma-international.org/ecma-262/8.0/#sec-isconcatspreadable',
	IsPromise: 'https://ecma-international.org/ecma-262/8.0/#sec-ispromise',
	ArraySpeciesCreate: 'https://ecma-international.org/ecma-262/8.0/#sec-arrayspeciescreate',
	ObjectCreate: 'https://ecma-international.org/ecma-262/8.0/#sec-objectcreate',
	AdvanceStringIndex: 'https://ecma-international.org/ecma-262/8.0/#sec-advancestringindex',
	OrdinarySet: 'https://ecma-international.org/ecma-262/8.0/#sec-ordinaryset',
	NormalCompletion: 'https://ecma-international.org/ecma-262/8.0/#sec-normalcompletion',
	IsSharedArrayBuffer: 'https://ecma-international.org/ecma-262/8.0/#sec-issharedarraybuffer',
};

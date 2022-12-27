'use strict';

var ES = require('../').ES2015;
var boundES = require('./helpers/createBoundESNamespace')(ES);

var ops = require('../operations/2015');

var expectedMissing = [
	'AddRestrictedFunctionProperties',
	'AllocateArrayBuffer',
	'AllocateTypedArray',
	'BoundFunctionCreate',
	'Canonicalize',
	'CharacterSetMatcher',
	'CloneArrayBuffer',
	'Completion',
	'Construct',
	'CopyDataBlockBytes',
	'CreateArrayFromList',
	'CreateArrayIterator',
	'CreateBuiltinFunction',
	'CreateByteDataBlock',
	'CreateDynamicFunction',
	'CreateIntrinsics',
	'CreateListIterator', // only used in FunctionDeclarationInstantiation
	'CreateMapIterator',
	'CreateMappedArgumentsObject', // takes a Parse Node
	'CreatePerIterationEnvironment',
	'CreateRealm',
	'CreateSetIterator',
	'CreateUnmappedArgumentsObject',
	'DaylightSavingTA',
	'Decode',
	'DetachArrayBuffer',
	'Encode',
	'EnqueueJob',
	'EscapeRegExpPattern',
	'EvalDeclarationInstantiation',
	'EvaluateCall',
	'EvaluateDirectCall',
	'EvaluateNew',
	'ForBodyEvaluation',
	'ForIn/OfBodyEvaluation',
	'ForIn/OfHeadEvaluation',
	'FulfillPromise',
	'FunctionAllocate',
	'FunctionCreate',
	'FunctionInitialize',
	'GeneratorFunctionCreate',
	'GeneratorResume',
	'GeneratorResumeAbrupt',
	'GeneratorStart',
	'GeneratorValidate',
	'GeneratorYield',
	'GetBase',
	'GetFunctionRealm',
	'GetGlobalObject',
	'GetIdentifierReference',
	'GetModuleNamespace',
	'GetNewTarget',
	'GetReferencedName',
	'GetSuperConstructor',
	'GetTemplateObject',
	'GetThisEnvironment',
	'GetThisValue',
	'GetValue',
	'GetValueFromBuffer',
	'GetViewValue',
	'HasPrimitiveBase',
	'ImportedLocalNames',
	'InitializeHostDefinedRealm',
	'InitializeReferencedBinding',
	'IntegerIndexedElementGet', // depends on GetValueFromBuffer
	'IntegerIndexedElementSet', // depends on SetValueInBuffer
	'IntegerIndexedObjectCreate',
	'InternalizeJSONProperty',
	'IsAnonymousFunctionDefinition',
	'IsDetachedBuffer',
	'IsInTailPosition',
	'IsLabelledFunction',
	'IsPropertyReference',
	'IsStrictReference',
	'IsSuperReference',
	'IsUnresolvableReference',
	'IsWordChar', // depends on WordCharacters
	'LocalTime',
	'LoopContinues', // completion records
	'MakeArgGetter',
	'MakeArgSetter',
	'MakeClassConstructor',
	'MakeConstructor',
	'MakeMethod',
	'MakeSuperPropertyReference',
	'max',
	'min',
	'ModuleNamespaceCreate',
	'msPerDay', // constant
	'NewDeclarativeEnvironment',
	'NewFunctionEnvironment',
	'NewGlobalEnvironment',
	'NewModuleEnvironment',
	'NewObjectEnvironment',
	'NewPromiseCapability',
	'NormalCompletion', // completion records
	'OrdinaryCallBindThis',
	'OrdinaryCallEvaluateBody',
	'ParseModule',
	'PerformEval',
	'PerformPromiseAll',
	'PerformPromiseRace',
	'PerformPromiseThen',
	'PrepareForOrdinaryCall',
	'PrepareForTailCall',
	'ProxyCreate',
	'PutValue', // takes a Reference
	'RegExpAlloc', // creates a regex with uninitialized internal slots
	'RegExpBuiltinExec',
	'RegExpInitialize', // initializes allocated regex's internal slots
	'RejectPromise',
	'RepeatMatcher',
	'ResolveBinding',
	'ResolveThisBinding',
	'SerializeJSONArray',
	'SerializeJSONObject',
	'SerializeJSONProperty',
	'SetDefaultGlobalBindings',
	'SetRealmGlobalObject',
	'SetValueInBuffer',
	'SetViewValue',
	'sign', // used in ES5, but not in ES2015, removed in ES2016
	'SortCompare', // mystery access to `comparefn` arg
	'TriggerPromiseReactions',
	'TypedArrayFrom',
	'UpdateEmpty', // completion records
	'UTC' // depends on LocalTZA, DaylightSavingTA
];

require('./tests').es2015(boundES, ops, expectedMissing);

require('./helpers/runManifestTest')(require('tape'), ES, 2015);

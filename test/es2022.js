'use strict';

var ES = require('../').ES2022;

var boundES = require('./helpers/createBoundESNamespace')(ES);
var ops = require('../operations/2022');

var expectedMissing = [
	'AddRestrictedFunctionProperties',
	'AddWaiter',
	'agent-order',
	'AgentCanSuspend',
	'AgentSignifier',
	'AllocateArrayBuffer',
	'AllocateSharedArrayBuffer',
	'AllocateTypedArray',
	'AllocateTypedArrayBuffer',
	'AsyncFunctionStart',
	'AsyncGeneratorEnqueue',
	'AsyncGeneratorStart',
	'AsyncGeneratorValidate',
	'AsyncGeneratorYield',
	'AtomicReadModifyWrite',
	'Await', // macro
	'BackreferenceMatcher',
	'BlockDeclarationInstantiation',
	'BoundFunctionCreate',
	'CaseClauseIsSelected',
	'CharacterRangeOrUnion',
	'CharacterSetMatcher',
	'CleanupFinalizationRegistry',
	'CloneArrayBuffer',
	'Completion',
	'ComposeWriteEventBytes',
	'Construct',
	'CopyDataBlockBytes',
	'CreateArrayFromList',
	'CreateArrayIterator', // es-create-array-iterator package, but it has a Type dependence and a shared ArrayIteratorPrototype
	'CreateAsyncIteratorFromClosure',
	'CreateBuiltinFunction',
	'CreateByteDataBlock',
	'CreateDynamicFunction',
	'CreateForInIterator',
	'CreateIntrinsics',
	'CreateIteratorFromClosure',
	'CreateListIteratorRecord', // only used in FunctionDeclarationInstantiation
	'CreateMapIterator',
	'CreateMappedArgumentsObject', // takes a Parse Node
	'CreatePerIterationEnvironment',
	'CreateRealm',
	'CreateResolvingFunctions',
	'CreateSetIterator',
	'CreateSharedByteDataBlock',
	'CreateUnmappedArgumentsObject',
	'Decode',
	'Encode',
	'EnterCriticalSection',
	'EnumerateObjectProperties', // only used in for-in loops
	'EscapeRegExpPattern',
	'EvalDeclarationInstantiation',
	'EvaluateCall',
	'EvaluateNew',
	'EvaluatePropertyAccessWithExpressionKey',
	'EvaluatePropertyAccessWithIdentifierKey',
	'EvaluateStringOrNumericBinaryExpression', // takes Parse Nodes
	'EventSet',
	'FinishDynamicImport',
	'ForBodyEvaluation',
	'ForIn/OfBodyEvaluation',
	'ForIn/OfHeadEvaluation',
	'FulfillPromise',
	'FunctionDeclarationInstantiation',
	'GeneratorResume',
	'GeneratorResumeAbrupt',
	'GeneratorStart',
	'GeneratorValidate',
	'GeneratorYield',
	'GetActiveScriptOrModule',
	'GetFunctionRealm',
	'GetGeneratorKind',
	'GetIdentifierReference',
	'GetModifySetValueInBuffer',
	'GetModuleNamespace',
	'GetNewTarget',
	'GetSuperConstructor',
	'GetTemplateObject',
	'GetThisEnvironment',
	'GetThisValue',
	'GetValue',
	'GetValueFromBuffer',
	'GetViewValue',
	'GetWaiterList',
	'GlobalDeclarationInstantiation',
	'happens-before',
	'host-synchronizes-with',
	'HostEventSet',
	'IfAbruptRejectPromise',
	'ImportedLocalNames',
	'InitializeBoundName',
	'InitializeHostDefinedRealm',
	'InitializeReferencedBinding',
	'InitializeTypedArrayFromArrayBuffer', // TypedArray initialization
	'InitializeTypedArrayFromArrayLike', // TypedArray initialization
	'InitializeTypedArrayFromList', // TypedArray initialization
	'InitializeTypedArrayFromTypedArray', // TypedArray initialization
	'InnerModuleEvaluation',
	'InnerModuleLinking',
	'IntegerIndexedElementGet', // depends on GetValueFromBuffer
	'IntegerIndexedElementSet', // depends on SetValueInBuffer
	'IntegerIndexedObjectCreate',
	'InternalizeJSONProperty',
	'IsAnonymousFunctionDefinition',
	'IsInTailPosition',
	'IsLabelledFunction',
	'IsPropertyReference',
	'IsSuperReference',
	'IsUnresolvableReference',
	'IsValidIntegerIndex',
	'IsValidRegularExpressionLiteral',
	'LeaveCriticalSection',
	'LocalTime',
	'LocalTZA',
	'LoopContinues', // completion records
	'MakeArgGetter',
	'MakeArgSetter',
	'MakeBasicObject',
	'MakeClassConstructor',
	'MakeConstructor',
	'MakeMethod',
	'MakeSuperPropertyReference',
	'memory-order',
	'ModuleNamespaceCreate',
	'NewDeclarativeEnvironment',
	'NewFunctionEnvironment',
	'NewGlobalEnvironment',
	'NewModuleEnvironment',
	'NewObjectEnvironment',
	'NewPromiseReactionJob',
	'NewPromiseResolveThenableJob',
	'NotifyWaiter',
	'OrdinaryCallBindThis',
	'OrdinaryCallEvaluateBody',
	'OrdinaryDelete',
	'OrdinaryFunctionCreate',
	'OrdinaryGet',
	'OrdinaryIsExtensible',
	'OrdinaryOwnPropertyKeys',
	'OrdinaryPreventExtensions',
	'OrdinarySet',
	'OrdinarySetWithOwnDescriptor',
	'ParseModule',
	'ParsePattern', // depends on ParseText, returns a Parse Node
	'ParseScript',
	'ParseText', // returns a Parse Node
	'PerformEval',
	'PerformPromiseAll',
	'PerformPromiseAllSettled',
	'PerformPromiseAny',
	'PerformPromiseRace',
	'PerformPromiseThen',
	'PrepareForOrdinaryCall',
	'PrepareForTailCall',
	'ProxyCreate',
	'PutValue', // takes a Reference
	'reads-bytes-from',
	'reads-from',
	'RegExpAlloc', // creates a regex with uninitialized internal slots
	'RegExpBuiltinExec',
	'RegExpInitialize', // initializes allocated regex's internal slots
	'RejectPromise',
	'RemoveWaiter',
	'RemoveWaiters',
	'RepeatMatcher',
	'RequireInternalSlot',
	'ResolveBinding',
	'ResolveThisBinding',
	'ReturnIfAbrupt',
	'ScriptEvaluation',
	'SerializeJSONArray',
	'SerializeJSONObject',
	'SerializeJSONProperty',
	'SetDefaultGlobalBindings',
	'SetImmutablePrototype',
	'SetRealmGlobalObject',
	'SetTypedArrayFromArrayLike', // TypedArray.prototype.set
	'SetTypedArrayFromTypedArray', // TypedArray.prototype.set
	'SetValueInBuffer',
	'SetViewValue',
	'SharedDataBlockEventSet',
	'SuspendAgent',
	'synchronizes-with',
	'TimeZoneString',
	'TriggerPromiseReactions',
	'UnicodeMatchProperty',
	'UnicodeMatchPropertyValue',
	'UpdateEmpty',
	'UTC', // depends on LocalTZA
	'ValueOfReadEvent',
	'Yield', // macro

	// new missings
	'AsyncBlockStart',
	'AsyncGeneratorAwaitReturn',
	'AsyncGeneratorCompleteStep',
	'AsyncGeneratorDrainQueue',
	'AsyncGeneratorResume',
	'AsyncGeneratorUnwrapYieldResumption',
	'AsyncModuleExecutionFulfilled',
	'AsyncModuleExecutionRejected',
	'DefineField', // used by class syntax to make fields
	'DefineMethodProperty', // used by class syntax to make class methods
	'ExecuteAsyncModule', // module stuff
	'GatherAvailableAncestors', // module stuff
	'IfAbruptCloseIterator',
	'InitializeInstanceElements', // used by class syntax
	'IsPrivateReference',
	'MakePrivateReference',
	'NewPrivateEnvironment',
	'PrivateElementFind',
	'PrivateFieldAdd',
	'PrivateGet',
	'PrivateMethodOrAccessorAdd',
	'PrivateSet',
	'ResolvePrivateIdentifier',
	'RoundMVResult'
];

require('./tests').es2022(boundES, ops, expectedMissing);

require('./helpers/runManifestTest')(require('tape'), ES, 2022);

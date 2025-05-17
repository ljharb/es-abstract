'use strict';

var expectedMissing = [
	'AddRestrictedFunctionProperties',
	'AddWaiter',
	'agent-order', // agent stuff
	'AgentCanSuspend', // agent stuff
	'AgentSignifier', // agent stuff
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
	'Completion',
	'ComposeWriteEventBytes',
	'Construct',
	'CopyDataBlockBytes',
	'CountLeftCapturingParensBefore', // takes a Parse Node
	'CountLeftCapturingParensWithin', // takes a Parse Node
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
	'GetNamedTimeZoneEpochNanoseconds',
	'GetNamedTimeZoneOffsetNanoseconds',
	'GetNewTarget',
	'GetSuperConstructor',
	'GetTemplateObject',
	'GetThisEnvironment',
	'GetThisValue',
	'GetValue',
	'GetViewValue',
	'GetWaiterList',
	'GlobalDeclarationInstantiation',
	'GroupSpecifiersThatMatch', // takes a Parse Node and returns a List of Parse Nodes
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
	'IsAnonymousFunctionDefinition',
	'IsInTailPosition',
	'IsLabelledFunction',
	'IsPropertyReference',
	'IsSuperReference',
	'IsUnresolvableReference',
	'IsValidRegularExpressionLiteral', // returns a Parse Node
	'LeaveCriticalSection',
	'LocalTime',
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
	'ParseTimeZoneOffsetString',
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
	'SetViewValue',
	'SharedDataBlockEventSet',
	'synchronizes-with',
	'TemplateString', // takes a Parse Node
	'TriggerPromiseReactions',
	'UnicodeMatchProperty',
	'UnicodeMatchPropertyValue',
	'UpdateEmpty',
	'UTC', // depends on LocalTZA
	'ValidateNonRevokedProxy',
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
	'ContinueDynamicImport',
	'ContinueModuleLoading',
	'DefineField', // used by class syntax to make fields
	'ExecuteAsyncModule', // module stuff
	'FinishLoadingImportedModule',
	'GatherAvailableAncestors', // module stuff
	'GetImportedModule',
	'IfAbruptCloseIterator',
	'InitializeInstanceElements', // used by class syntax
	'InnerModuleLoading',
	'IsPrivateReference',
	'MakePrivateReference',
	'NewPrivateEnvironment',
	'PrivateElementFind',
	'PrivateFieldAdd',
	'PrivateGet',
	'PrivateMethodOrAccessorAdd',
	'PrivateSet',
	'ResolvePrivateIdentifier',
	'RoundMVResult',
	'ValidateNonRevokedProxy',

	// new missings in 2024
	'AllCharacters',
	'AtomicCompareExchangeInSharedBlock', // atomics
	'AvailableNamedTimeZoneIdentifiers',
	'BuiltinCallOrConstruct',
	'CharacterComplement',
	'DoWait', // atomics
	'EmptyMatcher', // regex matcher stuff
	'EnqueueAtomicsWaitAsyncTimeoutJob',
	'EnqueueResolveInAgentJob', // agent stuff
	'GetUTCEpochNanoseconds',
	'GetRawBytesFromSharedBlock', // atomics
	'IsTimeZoneOffsetString',
	'MatchSequence', // regex matcher stuff
	'MatchTwoAlternatives', // regex matcher stuff
	'MaybeSimpleCaseFolding', // depends on scf
	'RevalidateAtomicAccess', // atomics
	'scf', // depends on CaseFolding data
	'SuspendThisAgent', // agent stuff
	'TypedArrayCreate', // JS can't create an undifferentiated Typed Array

	// deals with spec number types
	'𝔽',
	'ℝ',
	'ℤ'
];

var testYear = require('./helpers/testYear');

testYear(2024, expectedMissing);

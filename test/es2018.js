'use strict';

var ES = require('../').ES2018;

var ops = require('../operations/2018');

var expectedMissing = ['abs', 'AddRestrictedFunctionProperties', 'AddWaiter', 'agent-order', 'AgentCanSuspend', 'AgentSignifier', 'AllocateArrayBuffer', 'AllocateSharedArrayBuffer', 'AllocateTypedArray', 'AllocateTypedArrayBuffer', 'AsyncFunctionStart', 'AsyncGeneratorEnqueue', 'AsyncGeneratorReject', 'AsyncGeneratorResolve', 'AsyncGeneratorResumeNext', 'AsyncGeneratorStart', 'AsyncGeneratorYield', 'AtomicLoad', 'AtomicReadModifyWrite', 'Await', 'BlockDeclarationInstantiation', 'BoundFunctionCreate', 'Canonicalize', 'CaseClauseIsSelected', 'CharacterRange', 'CharacterRangeOrUnion', 'CharacterSetMatcher', 'CloneArrayBuffer', 'Completion', 'ComposeWriteEventBytes', 'CopyDataBlockBytes', 'CreateArrayIterator', 'CreateAsyncFromSyncIterator', 'CreateBuiltinFunction', 'CreateByteDataBlock', 'CreateDynamicFunction', 'CreateIntrinsics', 'CreateMapIterator', 'CreateMappedArgumentsObject', 'CreatePerIterationEnvironment', 'CreateRealm', 'CreateResolvingFunctions', 'CreateSetIterator', 'CreateSharedByteDataBlock', 'CreateStringIterator', 'CreateUnmappedArgumentsObject', 'Decode', 'DetachArrayBuffer', 'Encode', 'EnqueueJob', 'EnterCriticalSection', 'EnumerateObjectProperties', 'EscapeRegExpPattern', 'EvalDeclarationInstantiation', 'EvaluateCall', 'EvaluateNew', 'EventSet', 'floor', 'ForBodyEvaluation', 'ForIn/OfBodyEvaluation', 'ForIn/OfHeadEvaluation', 'FulfillPromise', 'FunctionAllocate', 'FunctionCreate', 'FunctionDeclarationInstantiation', 'FunctionInitialize', 'GeneratorFunctionCreate', 'GeneratorResume', 'GeneratorResumeAbrupt', 'GeneratorStart', 'GeneratorValidate', 'GeneratorYield', 'GetActiveScriptOrModule', 'GetBase', 'GetFunctionRealm', 'GetGeneratorKind', 'GetGlobalObject', 'GetIdentifierReference', 'GetModifySetValueInBuffer', 'GetModuleNamespace', 'GetNewTarget', 'GetPrototypeFromConstructor', 'GetReferencedName', 'GetSuperConstructor', 'GetTemplateObject', 'GetThisEnvironment', 'GetThisValue', 'GetValue', 'GetValueFromBuffer', 'GetViewValue', 'GetWaiterList', 'GlobalDeclarationInstantiation', 'happens-before', 'HasPrimitiveBase', 'host-synchronizes-with', 'HostEnsureCanCompileStrings', 'HostEventSet', 'HostPromiseRejectionTracker', 'HostReportErrors', 'HostResolveImportedModule', 'IfAbruptRejectPromise', 'ImportedLocalNames', 'InitializeBoundName', 'InitializeHostDefinedRealm', 'InitializeReferencedBinding', 'InnerModuleEvaluation', 'InnerModuleInstantiation', 'IntegerIndexedElementGet', 'IntegerIndexedElementSet', 'IntegerIndexedObjectCreate', 'InternalizeJSONProperty', 'IsAnonymousFunctionDefinition', 'IsCompatiblePropertyDescriptor', 'IsDetachedBuffer', 'IsInTailPosition', 'IsLabelledFunction', 'IsPropertyReference', 'IsSharedArrayBuffer', 'IsStrictReference', 'IsSuperReference', 'IsUnresolvableReference', 'IsWordChar', 'LeaveCriticalSection', 'LocalTime', 'LoopContinues', 'MakeArgGetter', 'MakeArgSetter', 'MakeClassConstructor', 'MakeConstructor', 'MakeMethod', 'MakeSuperPropertyReference', 'max', 'memory-order', 'min', 'ModuleDeclarationEnvironmentSetup', 'ModuleExecution', 'ModuleNamespaceCreate', 'NewDeclarativeEnvironment', 'NewFunctionEnvironment', 'NewGlobalEnvironment', 'NewModuleEnvironment', 'NewObjectEnvironment', 'NewPromiseCapability', 'NumberToRawBytes', 'ObjectDefineProperties', 'OrdinaryCallBindThis', 'OrdinaryCallEvaluateBody', 'OrdinaryCreateFromConstructor', 'OrdinaryDelete', 'OrdinaryGet', 'OrdinaryIsExtensible', 'OrdinaryOwnPropertyKeys', 'OrdinaryPreventExtensions', 'OrdinarySetPrototypeOf', 'OrdinaryToPrimitive', 'ParseModule', 'ParseScript', 'PerformEval', 'PerformPromiseAll', 'PerformPromiseRace', 'PerformPromiseThen', 'PrepareForOrdinaryCall', 'PrepareForTailCall', 'PromiseReactionJob', 'PromiseResolveThenableJob', 'ProxyCreate', 'PutValue', 'QuoteJSONString', 'RawBytesToNumber', 'reads-bytes-from', 'reads-from', 'RegExpAlloc', 'RegExpCreate', 'RegExpInitialize', 'RejectPromise', 'RemoveWaiter', 'RemoveWaiters', 'RepeatMatcher', 'ResolveBinding', 'ResolveThisBinding', 'ReturnIfAbrupt', 'RunJobs', 'ScriptEvaluation', 'ScriptEvaluationJob', 'SerializeJSONArray', 'SerializeJSONObject', 'SerializeJSONProperty', 'SetDefaultGlobalBindings', 'SetFunctionName', 'SetImmutablePrototype', 'SetRealmGlobalObject', 'SetValueInBuffer', 'SetViewValue', 'SharedDataBlockEventSet', 'SortCompare', 'SplitMatch', 'StringCreate', 'StringGetOwnProperty', 'Suspend', 'synchronizes-with', 'TimeZoneString', 'TopLevelModuleEvaluationJob', 'TriggerPromiseReactions', 'TypedArrayCreate', 'TypedArraySpeciesCreate', 'UnicodeEscape', 'UpdateEmpty', 'UTC', 'UTF16Decode', 'UTF16Encoding', 'ValidateAtomicAccess', 'ValidateSharedIntegerTypedArray', 'ValidateTypedArray', 'ValueOfReadEvent', 'WakeWaiter', 'WordCharacters', 'AsyncFunctionCreate', 'AsyncGeneratorFunctionCreate', 'AsyncIteratorClose', 'BackreferenceMatcher', 'Construct', 'CreateArrayFromList', 'CreateListFromArrayLike', 'CreateListIteratorRecord', 'NormalCompletion', 'OrdinarySet', 'OrdinarySetWithOwnDescriptor', 'RegExpBuiltinExec', 'SetFunctionLength', 'ThrowCompletion', 'UnicodeMatchProperty', 'UnicodeMatchPropertyValue'];

require('./tests').es2018(ES, ops, expectedMissing);

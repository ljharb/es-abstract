'use strict';

module.exports = {
	IsPropertyDescriptor: 'https://262.ecma-international.org/6.0/#sec-property-descriptor-specification-type', // not actually an abstract op

	abs: 'https://262.ecma-international.org/7.0/#sec-algorithm-conventions',
	'Abstract Equality Comparison': 'https://262.ecma-international.org/7.0/#sec-abstract-equality-comparison',
	'Abstract Relational Comparison': 'https://262.ecma-international.org/7.0/#sec-abstract-relational-comparison',
	AddRestrictedFunctionProperties: 'https://262.ecma-international.org/7.0/#sec-addrestrictedfunctionproperties',
	AdvanceStringIndex: 'https://262.ecma-international.org/7.0/#sec-advancestringindex',
	AllocateArrayBuffer: 'https://262.ecma-international.org/7.0/#sec-allocatearraybuffer',
	AllocateTypedArray: 'https://262.ecma-international.org/7.0/#sec-allocatetypedarray',
	AllocateTypedArrayBuffer: 'https://262.ecma-international.org/7.0/#sec-allocatetypedarraybuffer',
	ArrayCreate: 'https://262.ecma-international.org/7.0/#sec-arraycreate',
	ArraySetLength: 'https://262.ecma-international.org/7.0/#sec-arraysetlength',
	ArraySpeciesCreate: 'https://262.ecma-international.org/7.0/#sec-arrayspeciescreate',
	BlockDeclarationInstantiation: 'https://262.ecma-international.org/7.0/#sec-blockdeclarationinstantiation',
	BoundFunctionCreate: 'https://262.ecma-international.org/7.0/#sec-boundfunctioncreate',
	Call: 'https://262.ecma-international.org/7.0/#sec-call',
	Canonicalize: 'https://262.ecma-international.org/7.0/#sec-runtime-semantics-canonicalize-ch',
	CanonicalNumericIndexString: 'https://262.ecma-international.org/7.0/#sec-canonicalnumericindexstring',
	CharacterRange: 'https://262.ecma-international.org/7.0/#sec-runtime-semantics-characterrange-abstract-operation',
	CharacterRangeOrUnion: 'https://262.ecma-international.org/7.0/#sec-runtime-semantics-characterrangeorunion-abstract-operation',
	CharacterSetMatcher: 'https://262.ecma-international.org/7.0/#sec-runtime-semantics-charactersetmatcher-abstract-operation',
	CloneArrayBuffer: 'https://262.ecma-international.org/7.0/#sec-clonearraybuffer',
	CompletePropertyDescriptor: 'https://262.ecma-international.org/7.0/#sec-completepropertydescriptor',
	Completion: 'https://262.ecma-international.org/7.0/#sec-completion-record-specification-type',
	Construct: 'https://262.ecma-international.org/7.0/#sec-construct',
	CopyDataBlockBytes: 'https://262.ecma-international.org/7.0/#sec-copydatablockbytes',
	CreateArrayFromList: 'https://262.ecma-international.org/7.0/#sec-createarrayfromlist',
	CreateArrayIterator: 'https://262.ecma-international.org/7.0/#sec-createarrayiterator',
	CreateBuiltinFunction: 'https://262.ecma-international.org/7.0/#sec-createbuiltinfunction',
	CreateByteDataBlock: 'https://262.ecma-international.org/7.0/#sec-createbytedatablock',
	CreateDataProperty: 'https://262.ecma-international.org/7.0/#sec-createdataproperty',
	CreateDataPropertyOrThrow: 'https://262.ecma-international.org/7.0/#sec-createdatapropertyorthrow',
	CreateDynamicFunction: 'https://262.ecma-international.org/7.0/#sec-createdynamicfunction',
	CreateHTML: 'https://262.ecma-international.org/7.0/#sec-createhtml',
	CreateIntrinsics: 'https://262.ecma-international.org/7.0/#sec-createintrinsics',
	CreateIterResultObject: 'https://262.ecma-international.org/7.0/#sec-createiterresultobject',
	CreateListFromArrayLike: 'https://262.ecma-international.org/7.0/#sec-createlistfromarraylike',
	CreateListIterator: 'https://262.ecma-international.org/7.0/#sec-createlistiterator',
	CreateMapIterator: 'https://262.ecma-international.org/7.0/#sec-createmapiterator',
	CreateMappedArgumentsObject: 'https://262.ecma-international.org/7.0/#sec-createmappedargumentsobject',
	CreateMethodProperty: 'https://262.ecma-international.org/7.0/#sec-createmethodproperty',
	CreatePerIterationEnvironment: 'https://262.ecma-international.org/7.0/#sec-createperiterationenvironment',
	CreateRealm: 'https://262.ecma-international.org/7.0/#sec-createrealm',
	CreateResolvingFunctions: 'https://262.ecma-international.org/7.0/#sec-createresolvingfunctions',
	CreateSetIterator: 'https://262.ecma-international.org/7.0/#sec-createsetiterator',
	CreateStringIterator: 'https://262.ecma-international.org/7.0/#sec-createstringiterator',
	CreateUnmappedArgumentsObject: 'https://262.ecma-international.org/7.0/#sec-createunmappedargumentsobject',
	DateFromTime: 'https://262.ecma-international.org/7.0/#sec-date-number',
	Day: 'https://262.ecma-international.org/7.0/#sec-day-number-and-time-within-day',
	DayFromYear: 'https://262.ecma-international.org/7.0/#sec-year-number',
	DaysInYear: 'https://262.ecma-international.org/7.0/#sec-year-number',
	DayWithinYear: 'https://262.ecma-international.org/7.0/#sec-month-number',
	Decode: 'https://262.ecma-international.org/7.0/#sec-decode',
	DefinePropertyOrThrow: 'https://262.ecma-international.org/7.0/#sec-definepropertyorthrow',
	DeletePropertyOrThrow: 'https://262.ecma-international.org/7.0/#sec-deletepropertyorthrow',
	DetachArrayBuffer: 'https://262.ecma-international.org/7.0/#sec-detacharraybuffer',
	Encode: 'https://262.ecma-international.org/7.0/#sec-encode',
	EnqueueJob: 'https://262.ecma-international.org/7.0/#sec-enqueuejob',
	EnumerableOwnNames: 'https://262.ecma-international.org/7.0/#sec-enumerableownnames',
	EnumerateObjectProperties: 'https://262.ecma-international.org/7.0/#sec-enumerate-object-properties',
	EscapeRegExpPattern: 'https://262.ecma-international.org/7.0/#sec-escaperegexppattern',
	EvalDeclarationInstantiation: 'https://262.ecma-international.org/7.0/#sec-evaldeclarationinstantiation',
	EvaluateCall: 'https://262.ecma-international.org/7.0/#sec-evaluatecall',
	EvaluateDirectCall: 'https://262.ecma-international.org/7.0/#sec-evaluatedirectcall',
	EvaluateNew: 'https://262.ecma-international.org/7.0/#sec-evaluatenew',
	floor: 'https://262.ecma-international.org/7.0/#sec-algorithm-conventions',
	ForBodyEvaluation: 'https://262.ecma-international.org/7.0/#sec-forbodyevaluation',
	'ForIn/OfBodyEvaluation': 'https://262.ecma-international.org/7.0/#sec-runtime-semantics-forin-div-ofbodyevaluation-lhs-stmt-iterator-lhskind-labelset',
	'ForIn/OfHeadEvaluation': 'https://262.ecma-international.org/7.0/#sec-runtime-semantics-forin-div-ofheadevaluation-tdznames-expr-iterationkind',
	FromPropertyDescriptor: 'https://262.ecma-international.org/7.0/#sec-frompropertydescriptor',
	FulfillPromise: 'https://262.ecma-international.org/7.0/#sec-fulfillpromise',
	FunctionAllocate: 'https://262.ecma-international.org/7.0/#sec-functionallocate',
	FunctionCreate: 'https://262.ecma-international.org/7.0/#sec-functioncreate',
	FunctionDeclarationInstantiation: 'https://262.ecma-international.org/7.0/#sec-functiondeclarationinstantiation',
	FunctionInitialize: 'https://262.ecma-international.org/7.0/#sec-functioninitialize',
	GeneratorFunctionCreate: 'https://262.ecma-international.org/7.0/#sec-generatorfunctioncreate',
	GeneratorResume: 'https://262.ecma-international.org/7.0/#sec-generatorresume',
	GeneratorResumeAbrupt: 'https://262.ecma-international.org/7.0/#sec-generatorresumeabrupt',
	GeneratorStart: 'https://262.ecma-international.org/7.0/#sec-generatorstart',
	GeneratorValidate: 'https://262.ecma-international.org/7.0/#sec-generatorvalidate',
	GeneratorYield: 'https://262.ecma-international.org/7.0/#sec-generatoryield',
	Get: 'https://262.ecma-international.org/7.0/#sec-get-o-p',
	GetActiveScriptOrModule: 'https://262.ecma-international.org/7.0/#sec-getactivescriptormodule',
	GetFunctionRealm: 'https://262.ecma-international.org/7.0/#sec-getfunctionrealm',
	GetGlobalObject: 'https://262.ecma-international.org/7.0/#sec-getglobalobject',
	GetIdentifierReference: 'https://262.ecma-international.org/7.0/#sec-getidentifierreference',
	GetIterator: 'https://262.ecma-international.org/7.0/#sec-getiterator',
	GetMethod: 'https://262.ecma-international.org/7.0/#sec-getmethod',
	GetModuleNamespace: 'https://262.ecma-international.org/7.0/#sec-getmodulenamespace',
	GetNewTarget: 'https://262.ecma-international.org/7.0/#sec-getnewtarget',
	GetOwnPropertyKeys: 'https://262.ecma-international.org/7.0/#sec-getownpropertykeys',
	GetPrototypeFromConstructor: 'https://262.ecma-international.org/7.0/#sec-getprototypefromconstructor',
	GetSubstitution: 'https://262.ecma-international.org/7.0/#sec-getsubstitution',
	GetSuperConstructor: 'https://262.ecma-international.org/7.0/#sec-getsuperconstructor',
	GetTemplateObject: 'https://262.ecma-international.org/7.0/#sec-gettemplateobject',
	GetThisEnvironment: 'https://262.ecma-international.org/7.0/#sec-getthisenvironment',
	GetThisValue: 'https://262.ecma-international.org/7.0/#sec-getthisvalue',
	GetV: 'https://262.ecma-international.org/7.0/#sec-getv',
	GetValue: 'https://262.ecma-international.org/7.0/#sec-getvalue',
	GetValueFromBuffer: 'https://262.ecma-international.org/7.0/#sec-getvaluefrombuffer',
	GetViewValue: 'https://262.ecma-international.org/7.0/#sec-getviewvalue',
	GlobalDeclarationInstantiation: 'https://262.ecma-international.org/7.0/#sec-globaldeclarationinstantiation',
	HasOwnProperty: 'https://262.ecma-international.org/7.0/#sec-hasownproperty',
	HasProperty: 'https://262.ecma-international.org/7.0/#sec-hasproperty',
	HostPromiseRejectionTracker: 'https://262.ecma-international.org/7.0/#sec-host-promise-rejection-tracker',
	HostReportErrors: 'https://262.ecma-international.org/7.0/#sec-host-report-errors',
	HostResolveImportedModule: 'https://262.ecma-international.org/7.0/#sec-hostresolveimportedmodule',
	HourFromTime: 'https://262.ecma-international.org/7.0/#sec-hours-minutes-second-and-milliseconds',
	IfAbruptRejectPromise: 'https://262.ecma-international.org/7.0/#sec-ifabruptrejectpromise',
	ImportedLocalNames: 'https://262.ecma-international.org/7.0/#sec-importedlocalnames',
	InitializeBoundName: 'https://262.ecma-international.org/7.0/#sec-initializeboundname',
	InitializeHostDefinedRealm: 'https://262.ecma-international.org/7.0/#sec-initializehostdefinedrealm',
	InitializeReferencedBinding: 'https://262.ecma-international.org/7.0/#sec-initializereferencedbinding',
	InLeapYear: 'https://262.ecma-international.org/7.0/#sec-year-number',
	InstanceofOperator: 'https://262.ecma-international.org/7.0/#sec-instanceofoperator',
	IntegerIndexedElementGet: 'https://262.ecma-international.org/7.0/#sec-integerindexedelementget',
	IntegerIndexedElementSet: 'https://262.ecma-international.org/7.0/#sec-integerindexedelementset',
	IntegerIndexedObjectCreate: 'https://262.ecma-international.org/7.0/#sec-integerindexedobjectcreate',
	InternalizeJSONProperty: 'https://262.ecma-international.org/7.0/#sec-internalizejsonproperty',
	Invoke: 'https://262.ecma-international.org/7.0/#sec-invoke',
	IsAccessorDescriptor: 'https://262.ecma-international.org/7.0/#sec-isaccessordescriptor',
	IsAnonymousFunctionDefinition: 'https://262.ecma-international.org/7.0/#sec-isanonymousfunctiondefinition',
	IsArray: 'https://262.ecma-international.org/7.0/#sec-isarray',
	IsCallable: 'https://262.ecma-international.org/7.0/#sec-iscallable',
	IsCompatiblePropertyDescriptor: 'https://262.ecma-international.org/7.0/#sec-iscompatiblepropertydescriptor',
	IsConcatSpreadable: 'https://262.ecma-international.org/7.0/#sec-isconcatspreadable',
	IsConstructor: 'https://262.ecma-international.org/7.0/#sec-isconstructor',
	IsDataDescriptor: 'https://262.ecma-international.org/7.0/#sec-isdatadescriptor',
	IsDetachedBuffer: 'https://262.ecma-international.org/7.0/#sec-isdetachedbuffer',
	IsExtensible: 'https://262.ecma-international.org/7.0/#sec-isextensible-o',
	IsGenericDescriptor: 'https://262.ecma-international.org/7.0/#sec-isgenericdescriptor',
	IsInTailPosition: 'https://262.ecma-international.org/7.0/#sec-isintailposition',
	IsInteger: 'https://262.ecma-international.org/7.0/#sec-isinteger',
	IsLabelledFunction: 'https://262.ecma-international.org/7.0/#sec-islabelledfunction',
	IsPromise: 'https://262.ecma-international.org/7.0/#sec-ispromise',
	IsPropertyKey: 'https://262.ecma-international.org/7.0/#sec-ispropertykey',
	IsRegExp: 'https://262.ecma-international.org/7.0/#sec-isregexp',
	IsWordChar: 'https://262.ecma-international.org/7.0/#sec-runtime-semantics-iswordchar-abstract-operation',
	IterableToArrayLike: 'https://262.ecma-international.org/7.0/#sec-iterabletoarraylike',
	IteratorClose: 'https://262.ecma-international.org/7.0/#sec-iteratorclose',
	IteratorComplete: 'https://262.ecma-international.org/7.0/#sec-iteratorcomplete',
	IteratorNext: 'https://262.ecma-international.org/7.0/#sec-iteratornext',
	IteratorStep: 'https://262.ecma-international.org/7.0/#sec-iteratorstep',
	IteratorValue: 'https://262.ecma-international.org/7.0/#sec-iteratorvalue',
	LocalTime: 'https://262.ecma-international.org/7.0/#sec-localtime',
	LoopContinues: 'https://262.ecma-international.org/7.0/#sec-loopcontinues',
	MakeArgGetter: 'https://262.ecma-international.org/7.0/#sec-makearggetter',
	MakeArgSetter: 'https://262.ecma-international.org/7.0/#sec-makeargsetter',
	MakeClassConstructor: 'https://262.ecma-international.org/7.0/#sec-makeclassconstructor',
	MakeConstructor: 'https://262.ecma-international.org/7.0/#sec-makeconstructor',
	MakeDate: 'https://262.ecma-international.org/7.0/#sec-makedate',
	MakeDay: 'https://262.ecma-international.org/7.0/#sec-makeday',
	MakeMethod: 'https://262.ecma-international.org/7.0/#sec-makemethod',
	MakeSuperPropertyReference: 'https://262.ecma-international.org/7.0/#sec-makesuperpropertyreference',
	MakeTime: 'https://262.ecma-international.org/7.0/#sec-maketime',
	max: 'https://262.ecma-international.org/7.0/#sec-algorithm-conventions',
	min: 'https://262.ecma-international.org/7.0/#sec-algorithm-conventions',
	MinFromTime: 'https://262.ecma-international.org/7.0/#sec-hours-minutes-second-and-milliseconds',
	ModuleNamespaceCreate: 'https://262.ecma-international.org/7.0/#sec-modulenamespacecreate',
	modulo: 'https://262.ecma-international.org/7.0/#sec-algorithm-conventions',
	MonthFromTime: 'https://262.ecma-international.org/7.0/#sec-month-number',
	msFromTime: 'https://262.ecma-international.org/7.0/#sec-hours-minutes-second-and-milliseconds',
	NewDeclarativeEnvironment: 'https://262.ecma-international.org/7.0/#sec-newdeclarativeenvironment',
	NewFunctionEnvironment: 'https://262.ecma-international.org/7.0/#sec-newfunctionenvironment',
	NewGlobalEnvironment: 'https://262.ecma-international.org/7.0/#sec-newglobalenvironment',
	NewModuleEnvironment: 'https://262.ecma-international.org/7.0/#sec-newmoduleenvironment',
	NewObjectEnvironment: 'https://262.ecma-international.org/7.0/#sec-newobjectenvironment',
	NewPromiseCapability: 'https://262.ecma-international.org/7.0/#sec-newpromisecapability',
	NextJob: 'https://262.ecma-international.org/7.0/#sec-nextjob-result',
	NormalCompletion: 'https://262.ecma-international.org/7.0/#sec-normalcompletion',
	ObjectCreate: 'https://262.ecma-international.org/7.0/#sec-objectcreate',
	ObjectDefineProperties: 'https://262.ecma-international.org/7.0/#sec-objectdefineproperties',
	OrdinaryCallBindThis: 'https://262.ecma-international.org/7.0/#sec-ordinarycallbindthis',
	OrdinaryCallEvaluateBody: 'https://262.ecma-international.org/7.0/#sec-ordinarycallevaluatebody',
	OrdinaryCreateFromConstructor: 'https://262.ecma-international.org/7.0/#sec-ordinarycreatefromconstructor',
	OrdinaryDefineOwnProperty: 'https://262.ecma-international.org/7.0/#sec-ordinarydefineownproperty',
	OrdinaryDelete: 'https://262.ecma-international.org/7.0/#sec-ordinarydelete',
	OrdinaryGet: 'https://262.ecma-international.org/7.0/#sec-ordinaryget',
	OrdinaryGetOwnProperty: 'https://262.ecma-international.org/7.0/#sec-ordinarygetownproperty',
	OrdinaryGetPrototypeOf: 'https://262.ecma-international.org/7.0/#sec-ordinarygetprototypeof',
	OrdinaryHasInstance: 'https://262.ecma-international.org/7.0/#sec-ordinaryhasinstance',
	OrdinaryHasProperty: 'https://262.ecma-international.org/7.0/#sec-ordinaryhasproperty',
	OrdinaryIsExtensible: 'https://262.ecma-international.org/7.0/#sec-ordinaryisextensible',
	OrdinaryOwnPropertyKeys: 'https://262.ecma-international.org/7.0/#sec-ordinaryownpropertykeys',
	OrdinaryPreventExtensions: 'https://262.ecma-international.org/7.0/#sec-ordinarypreventextensions',
	OrdinarySet: 'https://262.ecma-international.org/7.0/#sec-ordinaryset',
	OrdinarySetPrototypeOf: 'https://262.ecma-international.org/7.0/#sec-ordinarysetprototypeof',
	ParseModule: 'https://262.ecma-international.org/7.0/#sec-parsemodule',
	ParseScript: 'https://262.ecma-international.org/7.0/#sec-parse-script',
	PerformEval: 'https://262.ecma-international.org/7.0/#sec-performeval',
	PerformPromiseAll: 'https://262.ecma-international.org/7.0/#sec-performpromiseall',
	PerformPromiseRace: 'https://262.ecma-international.org/7.0/#sec-performpromiserace',
	PerformPromiseThen: 'https://262.ecma-international.org/7.0/#sec-performpromisethen',
	PrepareForOrdinaryCall: 'https://262.ecma-international.org/7.0/#sec-prepareforordinarycall',
	PrepareForTailCall: 'https://262.ecma-international.org/7.0/#sec-preparefortailcall',
	PromiseReactionJob: 'https://262.ecma-international.org/7.0/#sec-promisereactionjob',
	PromiseResolveThenableJob: 'https://262.ecma-international.org/7.0/#sec-promiseresolvethenablejob',
	ProxyCreate: 'https://262.ecma-international.org/7.0/#sec-proxycreate',
	PutValue: 'https://262.ecma-international.org/7.0/#sec-putvalue',
	QuoteJSONString: 'https://262.ecma-international.org/7.0/#sec-quotejsonstring',
	RegExpAlloc: 'https://262.ecma-international.org/7.0/#sec-regexpalloc',
	RegExpBuiltinExec: 'https://262.ecma-international.org/7.0/#sec-regexpbuiltinexec',
	RegExpCreate: 'https://262.ecma-international.org/7.0/#sec-regexpcreate',
	RegExpExec: 'https://262.ecma-international.org/7.0/#sec-regexpexec',
	RegExpInitialize: 'https://262.ecma-international.org/7.0/#sec-regexpinitialize',
	RejectPromise: 'https://262.ecma-international.org/7.0/#sec-rejectpromise',
	RepeatMatcher: 'https://262.ecma-international.org/7.0/#sec-runtime-semantics-repeatmatcher-abstract-operation',
	RequireObjectCoercible: 'https://262.ecma-international.org/7.0/#sec-requireobjectcoercible',
	ResolveBinding: 'https://262.ecma-international.org/7.0/#sec-resolvebinding',
	ResolveThisBinding: 'https://262.ecma-international.org/7.0/#sec-resolvethisbinding',
	ReturnIfAbrupt: 'https://262.ecma-international.org/7.0/#sec-returnifabrupt',
	SameValue: 'https://262.ecma-international.org/7.0/#sec-samevalue',
	SameValueNonNumber: 'https://262.ecma-international.org/7.0/#sec-samevaluenonnumber',
	SameValueZero: 'https://262.ecma-international.org/7.0/#sec-samevaluezero',
	ScriptEvaluation: 'https://262.ecma-international.org/7.0/#sec-runtime-semantics-scriptevaluation',
	ScriptEvaluationJob: 'https://262.ecma-international.org/7.0/#sec-scriptevaluationjob',
	SecFromTime: 'https://262.ecma-international.org/7.0/#sec-hours-minutes-second-and-milliseconds',
	SerializeJSONArray: 'https://262.ecma-international.org/7.0/#sec-serializejsonarray',
	SerializeJSONObject: 'https://262.ecma-international.org/7.0/#sec-serializejsonobject',
	SerializeJSONProperty: 'https://262.ecma-international.org/7.0/#sec-serializejsonproperty',
	Set: 'https://262.ecma-international.org/7.0/#sec-set-o-p-v-throw',
	SetDefaultGlobalBindings: 'https://262.ecma-international.org/7.0/#sec-setdefaultglobalbindings',
	SetFunctionName: 'https://262.ecma-international.org/7.0/#sec-setfunctionname',
	SetIntegrityLevel: 'https://262.ecma-international.org/7.0/#sec-setintegritylevel',
	SetRealmGlobalObject: 'https://262.ecma-international.org/7.0/#sec-setrealmglobalobject',
	SetValueInBuffer: 'https://262.ecma-international.org/7.0/#sec-setvalueinbuffer',
	SetViewValue: 'https://262.ecma-international.org/7.0/#sec-setviewvalue',
	SortCompare: 'https://262.ecma-international.org/7.0/#sec-sortcompare',
	SpeciesConstructor: 'https://262.ecma-international.org/7.0/#sec-speciesconstructor',
	SplitMatch: 'https://262.ecma-international.org/7.0/#sec-splitmatch',
	'Strict Equality Comparison': 'https://262.ecma-international.org/7.0/#sec-strict-equality-comparison',
	StringCreate: 'https://262.ecma-international.org/7.0/#sec-stringcreate',
	SymbolDescriptiveString: 'https://262.ecma-international.org/7.0/#sec-symboldescriptivestring',
	TestIntegrityLevel: 'https://262.ecma-international.org/7.0/#sec-testintegritylevel',
	thisBooleanValue: 'https://262.ecma-international.org/7.0/#sec-thisbooleanvalue',
	thisNumberValue: 'https://262.ecma-international.org/7.0/#sec-properties-of-the-number-prototype-object',
	thisStringValue: 'https://262.ecma-international.org/7.0/#sec-properties-of-the-string-prototype-object',
	thisTimeValue: 'https://262.ecma-international.org/7.0/#sec-properties-of-the-date-prototype-object',
	TimeClip: 'https://262.ecma-international.org/7.0/#sec-timeclip',
	TimeFromYear: 'https://262.ecma-international.org/7.0/#sec-year-number',
	TimeWithinDay: 'https://262.ecma-international.org/7.0/#sec-day-number-and-time-within-day',
	ToBoolean: 'https://262.ecma-international.org/7.0/#sec-toboolean',
	ToDateString: 'https://262.ecma-international.org/7.0/#sec-todatestring',
	ToInt16: 'https://262.ecma-international.org/7.0/#sec-toint16',
	ToInt32: 'https://262.ecma-international.org/7.0/#sec-toint32',
	ToInt8: 'https://262.ecma-international.org/7.0/#sec-toint8',
	ToInteger: 'https://262.ecma-international.org/7.0/#sec-tointeger',
	ToLength: 'https://262.ecma-international.org/7.0/#sec-tolength',
	ToNumber: 'https://262.ecma-international.org/7.0/#sec-tonumber',
	ToObject: 'https://262.ecma-international.org/7.0/#sec-toobject',
	TopLevelModuleEvaluationJob: 'https://262.ecma-international.org/7.0/#sec-toplevelmoduleevaluationjob',
	ToPrimitive: 'https://262.ecma-international.org/7.0/#sec-toprimitive',
	ToPropertyDescriptor: 'https://262.ecma-international.org/7.0/#sec-topropertydescriptor',
	ToPropertyKey: 'https://262.ecma-international.org/7.0/#sec-topropertykey',
	ToString: 'https://262.ecma-international.org/7.0/#sec-tostring',
	'ToString Applied to the Number Type': 'https://262.ecma-international.org/7.0/#sec-tostring-applied-to-the-number-type',
	ToUint16: 'https://262.ecma-international.org/7.0/#sec-touint16',
	ToUint32: 'https://262.ecma-international.org/7.0/#sec-touint32',
	ToUint8: 'https://262.ecma-international.org/7.0/#sec-touint8',
	ToUint8Clamp: 'https://262.ecma-international.org/7.0/#sec-touint8clamp',
	TriggerPromiseReactions: 'https://262.ecma-international.org/7.0/#sec-triggerpromisereactions',
	Type: 'https://262.ecma-international.org/7.0/#sec-ecmascript-data-types-and-values',
	TypedArrayCreate: 'https://262.ecma-international.org/7.0/#typedarray-create',
	TypedArraySpeciesCreate: 'https://262.ecma-international.org/7.0/#typedarray-species-create',
	UpdateEmpty: 'https://262.ecma-international.org/7.0/#sec-updateempty',
	UTC: 'https://262.ecma-international.org/7.0/#sec-utc-t',
	UTF16Decode: 'https://262.ecma-international.org/7.0/#sec-utf16decode',
	UTF16Encoding: 'https://262.ecma-international.org/7.0/#sec-utf16encoding',
	ValidateAndApplyPropertyDescriptor: 'https://262.ecma-international.org/7.0/#sec-validateandapplypropertydescriptor',
	ValidateTypedArray: 'https://262.ecma-international.org/7.0/#sec-validatetypedarray',
	WeekDay: 'https://262.ecma-international.org/7.0/#sec-week-day',
	YearFromTime: 'https://262.ecma-international.org/7.0/#sec-year-number'
};

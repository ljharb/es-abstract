'use strict';

var v = require('es-value-fixtures');
var hasBigInts = require('has-bigints')();
var isCore = require('is-core-module');

var leadingPoo = '\uD83D';
var trailingPoo = '\uDCA9';
var wholePoo = leadingPoo + trailingPoo;

var msPerSecond = 1e3;
var msPerMinute = 60 * msPerSecond;
var msPerHour = 60 * msPerMinute;
var msPerDay = 24 * msPerHour;

var unknowns = /** @type {(typeof v.primitives[number] | typeof v.objects[number])[]} */ ([].concat(
	// @ts-expect-error TS sucks with concat
	v.primitives,
	v.objects
));
var allButSyms = /** @type {Exclude<typeof unknowns[number], symbol>[]} */ ([].concat(
	// @ts-expect-error TS sucks with concat
	v.objects,
	v.nonSymbolPrimitives
));
var invalidTATypes = /** @type {(typeof v.nonStrings[number] | 'not a valid type')[]} */ ([].concat(
	// @ts-expect-error TS sucks with concat
	v.nonStrings,
	'not a valid type'
));
/** @type {number[]} */
var nonFiniteNumbers = ([].concat(
	// @ts-expect-error TS sucks with concat
	v.infinities,
	NaN
));
/** @type {(number | Date | [])[]} */
var notInts = ([].concat(
	// @ts-expect-error TS sucks with concat
	v.nonNumbers,
	v.nonIntegerNumbers,
	nonFiniteNumbers,
	[],
	new Date()
));

var elementSizes = {
	__proto__: null,
	$Int8Array: 1,
	$Uint8Array: 1,
	$Uint8ClampedArray: 1,
	$Int16Array: 2,
	$Uint16Array: 2,
	$Int32Array: 4,
	$Uint32Array: 4,
	$BigInt64Array: 8,
	$BigUint64Array: 8,
	$Float32Array: 4,
	$Float64Array: 8
};

var unclampedUnsignedIntegerTypes = /** @type {const} */ ([
	'Int8',
	'Int16',
	'Int32'
]);
var clampedTypes = /** @type {const} */ ([
	'Uint8C'
]);
var unclampedSignedIntegerTypes = /** @type {const} */ ([
	'Uint8',
	'Uint16',
	'Uint32'
]);
/** @type {(typeof unclampedUnsignedIntegerTypes[number] | typeof unclampedSignedIntegerTypes[number])[]} */
var unclampedIntegerTypes = [].concat(
	// @ts-expect-error TS sucks with concat
	unclampedUnsignedIntegerTypes,
	unclampedSignedIntegerTypes
);
var floatTypes = /** @type {const} */ ([
	'Float32',
	'Float64'
]);
/** @type {(typeof unclampedIntegerTypes[number] | typeof clampedTypes[number] | typeof floatTypes[number])[]} */
var integerTypes = [].concat(
	// @ts-expect-error TS sucks with concat
	unclampedIntegerTypes,
	clampedTypes
);
var bigIntTypes = /** @type {const} */ ([
	'BigInt64',
	'BigUint64'
]);
/** @type {(typeof floatTypes[number] | typeof integerTypes[number])[]} */
var numberTypes = [].concat(
	// @ts-expect-error TS sucks with concat
	floatTypes,
	integerTypes
);
/** @type {(typeof floatTypes[number] | typeof bigIntTypes[number])[]} */
var nonUnclampedIntegerTypes = [].concat(
	// @ts-expect-error TS sucks with concat
	floatTypes,
	bigIntTypes
);
/** @type {(typeof unclampedSignedIntegerTypes[number] | 'BigUint64')[]} */
var unsignedElementTypes = [].concat(
	// @ts-expect-error TS sucks with concat
	unclampedSignedIntegerTypes,
	hasBigInts ? 'BigUint64' : []
);
/** @type {(typeof unclampedUnsignedIntegerTypes[number] | typeof floatTypes[number] | 'BigInt64')[]} */
var signedElementTypes = [].concat(
	// @ts-expect-error TS sucks with concat
	unclampedUnsignedIntegerTypes,
	floatTypes,
	hasBigInts ? 'BigInt64' : []
);
/** @type {(typeof numberTypes[number] | typeof bigIntTypes[number])[] | typeof numberTypes} */
var allTypes = [].concat(
	// @ts-expect-error TS sucks with concat
	numberTypes,
	hasBigInts ? bigIntTypes : []
);
var nonTATypes = /** @type {(typeof v.nonStrings[number] | '' | 'Byte')[]} */ ([].concat(
	// @ts-expect-error TS sucks with concat
	v.nonStrings,
	'',
	'Byte'
));

var canDistinguishSparseFromUndefined = 0 in [undefined]; // IE 6 - 8 have a bug where this returns false

// IE 9 does not throw in strict mode when writability/configurability/extensibility is violated
var noThrowOnStrictViolation = (function () {
	try {
		// @ts-expect-error most engines throw here
		delete [].length;
		return true;
	} catch (e) {
	}
	return false;
}());

/** @type {(type: string) => type is `Big${string}`} */
var isBigIntTAType = function isBigIntTAType(type) {
	return type.slice(0, 3) === 'Big';
};

/* globals postMessage */
var canDetach = typeof structuredClone === 'function' || typeof postMessage === 'function' || isCore('worker_threads');

module.exports = {
	poo: {
		leading: leadingPoo,
		trailing: trailingPoo,
		whole: wholePoo
	},
	hasBigInts: hasBigInts,
	msPerSecond: msPerSecond,
	msPerMinute: msPerMinute,
	msPerHour: msPerHour,
	msPerDay: msPerDay,
	unknowns: unknowns,
	allButSyms: allButSyms,
	invalidTATypes: invalidTATypes,
	nonFiniteNumbers: nonFiniteNumbers,
	notInts: notInts,
	elementSizes: elementSizes,
	unclampedUnsignedIntegerTypes: unclampedUnsignedIntegerTypes,
	clampedTypes: clampedTypes,
	unclampedSignedIntegerTypes: unclampedSignedIntegerTypes,
	unclampedIntegerTypes: unclampedIntegerTypes,
	floatTypes: floatTypes,
	integerTypes: integerTypes,
	bigIntTypes: bigIntTypes,
	numberTypes: numberTypes,
	nonUnclampedIntegerTypes: nonUnclampedIntegerTypes,
	unsignedElementTypes: unsignedElementTypes,
	signedElementTypes: signedElementTypes,
	allTypes: allTypes,
	nonTATypes: nonTATypes,
	canDistinguishSparseFromUndefined: canDistinguishSparseFromUndefined,
	noThrowOnStrictViolation: noThrowOnStrictViolation,
	isBigIntTAType: isBigIntTAType,
	canDetach: canDetach
};

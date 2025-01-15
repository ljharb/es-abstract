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

var unknowns = [].concat(
	v.primitives,
	v.objects
);
var allButSyms = [].concat(
	v.objects,
	v.nonSymbolPrimitives
);
var invalidTATypes = [].concat(
	v.nonStrings,
	'not a valid type'
);
var nonFiniteNumbers = [].concat(
	v.infinities,
	NaN
);
var notInts = [].concat(
	v.nonNumbers,
	v.nonIntegerNumbers,
	nonFiniteNumbers,
	[],
	new Date()
);

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

var unclampedUnsignedIntegerTypes = [
	'Int8',
	'Int16',
	'Int32'
];
var clampedTypes = [
	'Uint8C'
];
var unclampedSignedIntegerTypes = [
	'Uint8',
	'Uint16',
	'Uint32'
];
var unclampedIntegerTypes = [].concat(
	unclampedUnsignedIntegerTypes,
	unclampedSignedIntegerTypes
);
var floatTypes = [
	'Float32',
	'Float64'
];
var integerTypes = [].concat(
	unclampedIntegerTypes,
	clampedTypes
);
var bigIntTypes = [
	'BigInt64',
	'BigUint64'
];
var numberTypes = [].concat(
	floatTypes,
	integerTypes
);
var nonUnclampedIntegerTypes = [].concat(
	floatTypes,
	bigIntTypes
);
var unsignedElementTypes = [].concat(
	unclampedSignedIntegerTypes,
	hasBigInts ? 'BigUint64' : []
);
var signedElementTypes = [].concat(
	unclampedUnsignedIntegerTypes,
	floatTypes,
	hasBigInts ? 'BigInt64' : []
);
var allTypes = [].concat(
	numberTypes,
	hasBigInts ? bigIntTypes : []
);
var nonTATypes = [].concat(
	v.nonStrings,
	'',
	'Byte'
);

var canDistinguishSparseFromUndefined = 0 in [undefined]; // IE 6 - 8 have a bug where this returns false

// IE 9 does not throw in strict mode when writability/configurability/extensibility is violated
var noThrowOnStrictViolation = (function () {
	try {
		delete [].length;
		return true;
	} catch (e) {
	}
	return false;
}());

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

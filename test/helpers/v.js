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

var getUnclampedUnsignedIntegerTypes = function () {
	return [
		'Int8',
		'Int16',
		'Int32'
	];
};
var getClampedTypes = function () {
	return [
		'Uint8C'
	];
};
var getUnclampedSignedIntegerTypes = function () {
	return [
		'Uint8',
		'Uint16',
		'Uint32'
	];
};
var getUnclampedIntegerTypes = function (year) {
	return [].concat(
		getUnclampedUnsignedIntegerTypes(year),
		getUnclampedSignedIntegerTypes(year)
	);
};
var getFloatTypes = function (year) {
	return [].concat(
		year >= 2025 ? 'Float16' : [],
		'Float32',
		'Float64'
	);
};
var getIntegerTypes = function (year) {
	return [].concat(
		getUnclampedIntegerTypes(year),
		getClampedTypes(year)
	);
};
var getBigIntTypes = function (year) {
	return year >= 2020 ? [
		'BigInt64',
		'BigUint64'
	] : [];
};
var getNumberTypes = function (year) {
	return [].concat(
		getFloatTypes(year),
		getIntegerTypes(year)
	);
};
var getNonUnclampedIntegerTypes = function (year) {
	return [].concat(
		getFloatTypes(year),
		getBigIntTypes(year)
	);
};
var getUnsignedElementTypes = function (year) {
	return [].concat(
		getUnclampedSignedIntegerTypes(year),
		year >= 2020 && hasBigInts ? 'BigUint64' : []
	);
};
var getSignedElementTypes = function (year) {
	return [].concat(
		getUnclampedUnsignedIntegerTypes(year),
		getFloatTypes(year),
		year >= 2020 && hasBigInts ? 'BigInt64' : []
	);
};
var getTATypes = function (year) {
	return [].concat(
		getNumberTypes(year),
		year >= 2020 && hasBigInts ? getBigIntTypes(year) : []
	);
};
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
	getUnclampedUnsignedIntegerTypes: getUnclampedUnsignedIntegerTypes,
	getClampedTypes: getClampedTypes,
	getUnclampedSignedIntegerTypes: getUnclampedSignedIntegerTypes,
	getUnclampedIntegerTypes: getUnclampedIntegerTypes,
	getFloatTypes: getFloatTypes,
	getIntegerTypes: getIntegerTypes,
	getBigIntTypes: getBigIntTypes,
	getNumberTypes: getNumberTypes,
	getNonUnclampedIntegerTypes: getNonUnclampedIntegerTypes,
	getUnsignedElementTypes: getUnsignedElementTypes,
	getSignedElementTypes: getSignedElementTypes,
	getTATypes: getTATypes,
	nonTATypes: nonTATypes,
	canDistinguishSparseFromUndefined: canDistinguishSparseFromUndefined,
	noThrowOnStrictViolation: noThrowOnStrictViolation,
	isBigIntTAType: isBigIntTAType,
	canDetach: canDetach
};

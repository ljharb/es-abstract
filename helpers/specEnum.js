'use strict';

// Runtime counterpart of the `SpecEnum<Year, Name>` type in `./types.d.ts`. Given an edition
// `year` (a number, e.g. from `<edition>/year`) and the canonical lowercase-kebab `name` of a
// spec "enum"/marker value, returns that value spelled the way the given edition spells it:
//  - ES2026+: uppercased + `~`-wrapped -- `'seq-cst'` -> `'~SEQ-CST~'`, `'key'` -> `'~KEY~'`.
//  - ES2024-2025: uppercased -- `'detached'` -> `'DETACHED'` -- except iteration-kind/hint values.
//  - <=ES2023: memory-order values are PascalCase (`'seq-cst'` -> `'SeqCst'`), element types are
//    mixed-case (`'bigint64'` -> `'BigInt64'`), iteration-kind/hint values stay lowercase.
// The casing tracks here must stay in lockstep with the `SpecEnum` type's branches.

// iteration-kind / hint / integrity-level values: spelled lowercase in every edition through ES2025.
var lowercaseEnums = [
	'key',
	'value',
	'key+value',
	'start',
	'end',
	'start+end',
	'number',
	'string',
	'sealed',
	'frozen'
];

// memory-order values: spelled PascalCase (not uppercase) before ES2024.
var pascalOldEnums = [
	'seq-cst',
	'unordered',
	'init'
];

// TypedArray element types: spelled mixed-case before ES2024.
var elementTypeEnums = [
	'int8',
	'uint8',
	'uint8c',
	'int16',
	'uint16',
	'int32',
	'uint32',
	'bigint64',
	'biguint64',
	'float16',
	'float32',
	'float64'
];

var indexOf = require('call-bound')('Array.prototype.indexOf');
var toUpperCase = require('call-bound')('String.prototype.toUpperCase');
var charAt = require('call-bound')('String.prototype.charAt');
var slice = require('call-bound')('String.prototype.slice');
var split = require('call-bound')('String.prototype.split');

var capitalize = function capitalize(s) {
	return toUpperCase(charAt(s, 0)) + slice(s, 1);
};

var kebabToPascal = function kebabToPascal(s) {
	var parts = split(s, '-');
	var out = '';
	for (var i = 0; i < parts.length; i += 1) {
		out += capitalize(parts[i]);
	}
	return out;
};

// the <=ES2023 mixed-case spelling of an element type. Most are `capitalize`, but three have an
// irregular internal capital that `capitalize` cannot produce.
var elementMixedCase = function elementMixedCase(name) {
	if (name === 'uint8c') { return 'Uint8C'; }
	if (name === 'bigint64') { return 'BigInt64'; }
	if (name === 'biguint64') { return 'BigUint64'; }
	return capitalize(name);
};

module.exports = function specEnum(year, name) {
	if (year >= 2026) {
		return '~' + toUpperCase(name) + '~';
	}
	if (indexOf(lowercaseEnums, name) > -1) {
		return name;
	}
	if (year >= 2024) {
		return toUpperCase(name);
	}
	if (indexOf(pascalOldEnums, name) > -1) {
		return kebabToPascal(name);
	}
	if (indexOf(elementTypeEnums, name) > -1) {
		return elementMixedCase(name);
	}
	return name;
};

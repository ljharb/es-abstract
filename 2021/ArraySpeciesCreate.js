'use strict';

var GetIntrinsic = require('get-intrinsic');

var $species = GetIntrinsic('%Symbol.species%', true);
var $TypeError = require('es-errors/type');
var isInteger = require('math-intrinsics/isInteger');
var isObject = require('es-object-atoms/isObject');

var ArrayCreate = require('./ArrayCreate');
var Get = require('./Get');
var IsArray = require('./IsArray');
var IsConstructor = require('./IsConstructor');

// https://262.ecma-international.org/12.0/#sec-arrayspeciescreate

/** @type {<T>(originalArray: T[] & { [k: string | symbol]: unknown, constructor?: import('../types').Constructor<T[], ArrayConstructor> }, length: import('../types').integer) => T[]} */
module.exports = function ArraySpeciesCreate(originalArray, length) {
	if (!isInteger(length) || length < 0) {
		throw new $TypeError('Assertion failed: length must be an integer >= 0');
	}

	var isArray = IsArray(originalArray);
	if (!isArray) {
		// @ts-expect-error this function is weird
		return ArrayCreate(length);
	}

	var C = Get(originalArray, 'constructor');
	// TODO: figure out how to make a cross-realm normal Array, a same-realm Array
	// if (IsConstructor(C)) {
	// 	if C is another realm's Array, C = undefined
	// 	Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(Array))) === null ?
	// }
	if ($species && isObject(C)) {
		C = Get(C, $species);
		if (C === null) {
			C = void 0;
		}
	}

	if (typeof C === 'undefined') {
		// @ts-expect-error this function is weird
		return ArrayCreate(length);
	}
	if (!IsConstructor(C)) {
		throw new $TypeError('C must be a constructor');
	}
	return new C(length); // Construct(C, length);
};


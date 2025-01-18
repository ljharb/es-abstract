'use strict';

var callBound = require('call-bound');

var $TypeError = require('es-errors/type');
var isInteger = require('math-intrinsics/isInteger');
var isObject = require('es-object-atoms/isObject');

var DeletePropertyOrThrow = require('./DeletePropertyOrThrow');
// var Get = require('./Get');
var HasProperty = require('./HasProperty');
var Set = require('./Set');
var ToString = require('./ToString');

var isAbstractClosure = require('../helpers/isAbstractClosure');

var $sort = callBound('Array.prototype.sort');

// https://262.ecma-international.org/13.0/#sec-sortindexedproperties

/** @type {<V>(obj: import('../types').PartialBy<ArrayLike<V>, 'length'>, len: import('../types').nonNegativeInteger, SortCompare: (a: any, b: any) => number) => typeof obj} */
module.exports = function SortIndexedProperties(obj, len, SortCompare) {
	if (!isObject(obj)) {
		throw new $TypeError('Assertion failed: Type(obj) is not Object');
	}
	if (!isInteger(len) || len < 0) {
		throw new $TypeError('Assertion failed: `len` must be an integer >= 0');
	}
	if (!isAbstractClosure(SortCompare) || SortCompare.length !== 2) {
		throw new $TypeError('Assertion failed: `SortCompare` must be an abstract closure taking 2 arguments');
	}

	/** @typedef {typeof obj[number]} V */

	/** @type {V[]} */
	var items = []; // step 1

	var k = 0; // step 2

	while (k < len) { // step 3
		var Pk = ToString(k);
		var kPresent = HasProperty(obj, Pk);
		if (kPresent) {
			var kValue = obj[k]; // Get(obj, Pk);
			items[items.length] = kValue;
		}
		k += 1;
	}

	var itemCount = items.length; // step 4

	$sort(items, SortCompare); // step 5

	var j = 0; // step 6

	while (j < itemCount) { // step 7
		Set(/** @type {Record<string, number | V>} */ (/** @type {unknown} */ (obj)), ToString(j), items[j], true);
		j += 1;
	}

	while (j < len) { // step 8
		DeletePropertyOrThrow(/** @type {Record<string, number | V>} */ (/** @type {unknown} */ (obj)), ToString(j));
		j += 1;
	}
	return obj; // step 9
};

'use strict';

var getIteratorMethod = require('../helpers/getIteratorMethod');
var AdvanceStringIndex = require('./AdvanceStringIndex');
var GetIterator = require('./GetIterator');
var GetMethod = require('./GetMethod');
var IteratorStep = require('./IteratorStep');
var IteratorValue = require('./IteratorValue');
var ToObject = require('./ToObject');

/** @type {import('../helpers/types').esSubset<unknown>} */
var ES = {
	AdvanceStringIndex: AdvanceStringIndex,
	GetMethod: GetMethod
};

// https://262.ecma-international.org/7.0/#sec-iterabletoarraylike

/** @type {<T>(items: Partial<Iterable<T>> | T[]) => T[]} */
module.exports = function IterableToArrayLike(items) {
	/** @typedef {import('../types').InferIterableType<typeof items>} T */
	var usingIterator = getIteratorMethod(ES, items);
	if (typeof usingIterator !== 'undefined') {
		var iterator = /** @type {Iterator<T>} */ (GetIterator(items, usingIterator));
		/** @type {T[]} */
		var values = [];
		/** @type {false | ReturnType<typeof IteratorStep>} */
		// @ts-expect-error
		var next = true;
		while (next) {
			/** @type {false | Partial<IteratorResult<T>>} */
			next = IteratorStep(iterator);
			if (next) {
				var nextValue = /** @type {T} */ (IteratorValue(next));
				values[values.length] = nextValue;
			}
		}
		return values;
	}

	return ToObject(/** @type {T[]} */ (items));
};

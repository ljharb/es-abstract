'use strict';

var GetIterator = require('./GetIterator');
var IteratorStep = require('./IteratorStep');
var IteratorValue = require('./IteratorValue');

// https://262.ecma-international.org/9.0/#sec-iterabletolist

/** @type {<T>(items: Iterable<T>, method: (this: Iterable<T>) => Iterator<T>) => T[]} */
module.exports = function IterableToList(items, method) {
	/** @typedef {import('../types').InferIterableType<typeof items>} T */

	var iterator = GetIterator(items, 'sync', method);
	/** @type {T[]} */
	var values = [];
	/** @type {false | Partial<IteratorResult<T>>} */
	// @ts-expect-error
	var next = true;
	while (next) {
		next = IteratorStep(iterator);
		if (next) {
			var nextValue = IteratorValue(next);
			values[values.length] = nextValue;
		}
	}
	return values;
};

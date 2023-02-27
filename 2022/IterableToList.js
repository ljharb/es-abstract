// @ts-nocheck

'use strict';

var GetIterator = require('./GetIterator');
var IteratorStep = require('./IteratorStep');
var IteratorValue = require('./IteratorValue');

// https://262.ecma-international.org/12.0/#sec-iterabletolist

/** @type {<T>(items: Iterable<T>, method?: (this: Iterable<T>) => Iterator<T>) => T[]} */
module.exports = function IterableToList(items) {
	/** @typedef {import('../types').InferIterableType<typeof items>} T */

	var iterator;
	if (arguments.length > 1) {
		iterator = GetIterator(items, 'sync', arguments[1]);
	} else {
		iterator = GetIterator(items, 'sync');
	}
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

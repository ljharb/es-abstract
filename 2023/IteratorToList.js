'use strict';

var $TypeError = require('es-errors/type');

var IteratorStep = require('./IteratorStep');
var IteratorValue = require('./IteratorValue');

var isIteratorRecord = require('../helpers/records/iterator-record-2023');

// https://262.ecma-international.org/14.0/#sec-iteratortolist

/** @type {<T>(iteratorRecord: import('../types').IteratorRecord2023<T>) => T[]} */
module.exports = function IteratorToList(iteratorRecord) {
	if (!isIteratorRecord(iteratorRecord)) {
		throw new $TypeError('Assertion failed: `iteratorRecord` must be an Iterator Record'); // step 1
	}

	/** @typedef {import('../types').InferIteratorType<typeof iteratorRecord['[[Iterator]]']>} T */

	/** @type {unknown[]} */
	var values = []; // step 1
	/** @type {false | Partial<IteratorResult<T>>} */
	// @ts-expect-error
	var next = true; // step 2
	while (next) { // step 3
		next = IteratorStep(iteratorRecord); // step 3.a
		if (next) {
			var nextValue = IteratorValue(next); // step 3.b.i
			values[values.length] = nextValue; // step 3.b.ii
		}
	}
	// @ts-expect-error I can't figure out how to reference `T` in the type of `values`
	return values; // step 4
};

'use strict';

var makeIteratorRecord = require('./makeIteratorRecord');

/** @type {<T>(CreateAsyncFromSyncIterator: import('../testHelpers').AOUnion<'CreateAsyncFromSyncIterator'>, end: number, throwMethod?: (...args: any[]) => never, returnMethod?: (...args: unknown[]) => T) => import('../../types').AsyncIteratorRecord<T>} */
module.exports = function makeAsyncFromSyncIterator(CreateAsyncFromSyncIterator, end, throwMethod, returnMethod) {
	var i = 0;
	/** @type {Iterator<number>} */
	var iterator = {
		next: function next() {
			try {
				return /** @type {IteratorResult<number>} */ ({
					done: i > end,
					value: i
				});
			} finally {
				i += 1;
			}
		},
		'return': returnMethod,
		'throw': throwMethod
	};
	var syncIteratorRecord = makeIteratorRecord(iterator);

	return CreateAsyncFromSyncIterator(syncIteratorRecord);
};

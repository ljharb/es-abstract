'use strict';

var makeIteratorRecord = require('./makeIteratorRecord');

/** @type {(CreateAsyncFromSyncIterator<T>(syncIteratorRecord: import('../../types').IteratorRecord<T>): import('../../types').AsyncIteratorRecord<T>, end: number, throwMethod?: (...args: any[]) => never, returnMethod?: () => T) => import('../../types').AsyncIteratorRecord<T>} */
module.exports = function makeAsyncFromSyncIterator(CreateAsyncFromSyncIterator, end, throwMethod, returnMethod) {
	var i = 0;
	var iterator = {
		next: function next() {
			try {
				return {
					done: i > end,
					value: i
				};
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

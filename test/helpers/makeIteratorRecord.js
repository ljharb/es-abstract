'use strict';

/** @type {<T>(iterator: Iterator<T>) => import('../../types').IteratorRecord<T>} */
module.exports = function makeIteratorRecord(iterator) {
	return {
		'[[Iterator]]': iterator,
		'[[NextMethod]]': iterator.next,
		'[[Done]]': false
	};
};

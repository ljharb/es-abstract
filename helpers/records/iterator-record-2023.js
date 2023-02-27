'use strict';

var isIteratorRecordNew = require('./iterator-record');

/** @type {<T>(value: unknown) => value is import('../../types').IteratorRecord2023<T>} */
module.exports = function isIteratorRecord(value) {
	return isIteratorRecordNew(value)
		&& '[[NextMethod]]' in value
		&& typeof value['[[NextMethod]]'] === 'function';
};

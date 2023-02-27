'use strict';

var hasOwn = require('hasown');

/** @type {<T>(value: unknown) => value is import('../../types').IteratorRecord<T>} */
module.exports = function isIteratorRecord(value) {
	return !!value
		&& typeof value === 'object'
		&& hasOwn(value, '[[Iterator]]')
		&& hasOwn(value, '[[NextMethod]]')
		&& hasOwn(value, '[[Done]]')
		&& '[[Done]]' in value
		&& typeof value['[[Done]]'] === 'boolean';
};

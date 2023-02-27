'use strict';

/** @type {(value: unknown) => value is import('../types').primitive} */
module.exports = function isPrimitive(value) {
	return value === null || (typeof value !== 'function' && typeof value !== 'object');
};

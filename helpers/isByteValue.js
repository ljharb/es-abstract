'use strict';

/** @type {(value: unknown) => value is import('../types').ByteValue} */
module.exports = function isByteValue(value) {
	return typeof value === 'number' && value >= 0 && value <= 255 && (value | 0) === value;
};

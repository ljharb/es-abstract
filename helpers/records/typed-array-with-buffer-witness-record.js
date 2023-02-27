'use strict';

var hasOwn = require('hasown');
var isTypedArray = require('is-typed-array');

var isInteger = require('../isInteger');

/** @type {(value: unknown) => value is import('../../types').TypedArrayWithBufferWitnessRecord} */
module.exports = function isTypedArrayWithBufferWitnessRecord(value) {
	return !!value
		&& typeof value === 'object'
		&& hasOwn(value, '[[Object]]')
		&& '[[Object]]' in value
		&& hasOwn(value, '[[CachedBufferByteLength]]')
		&& '[[CachedBufferByteLength]]' in value
		&& (
			(isInteger(value['[[CachedBufferByteLength]]']) && value['[[CachedBufferByteLength]]'] >= 0)
			|| value['[[CachedBufferByteLength]]'] === 'DETACHED'
		)
		&& isTypedArray(value['[[Object]]']);
};

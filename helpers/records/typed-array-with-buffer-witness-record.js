'use strict';

var hasOwn = require('hasown');
var isTypedArray = require('is-typed-array');

var isInteger = require('../isInteger');
var specEnum = require('../specEnum');

module.exports = function isTypedArrayWithBufferWitnessRecord(value, year) {
	return !!value
		&& typeof value === 'object'
		&& hasOwn(value, '[[Object]]')
		&& hasOwn(value, '[[CachedBufferByteLength]]')
		&& (
			(isInteger(value['[[CachedBufferByteLength]]']) && value['[[CachedBufferByteLength]]'] >= 0)
			|| value['[[CachedBufferByteLength]]'] === specEnum(year, 'detached')
		)
		&& isTypedArray(value['[[Object]]']);
};

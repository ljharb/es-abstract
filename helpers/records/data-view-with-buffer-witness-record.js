'use strict';

var hasOwn = require('hasown');
var isDataView = require('is-data-view');

var isInteger = require('../isInteger');

/** @type {(value: unknown) => value is import('../../types').DataViewWithBufferWitnessRecord} */
module.exports = function isDataViewWithBufferWitnessRecord(value) {
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
		&& isDataView(value['[[Object]]']);
};

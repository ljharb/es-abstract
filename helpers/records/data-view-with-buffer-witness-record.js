'use strict';

var hasOwn = require('hasown');
var isDataView = require('is-data-view');

var isInteger = require('../isInteger');
var specEnum = require('../specEnum');

module.exports = function isDataViewWithBufferWitnessRecord(value, year) {
	return !!value
		&& typeof value === 'object'
		&& hasOwn(value, '[[Object]]')
		&& hasOwn(value, '[[CachedBufferByteLength]]')
		&& (
			(isInteger(value['[[CachedBufferByteLength]]']) && value['[[CachedBufferByteLength]]'] >= 0)
			|| value['[[CachedBufferByteLength]]'] === specEnum(year, 'detached')
		)
		&& isDataView(value['[[Object]]']);
};

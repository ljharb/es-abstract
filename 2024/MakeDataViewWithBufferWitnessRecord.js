'use strict';

var $TypeError = require('es-errors/type');

var ArrayBufferByteLength = require('./ArrayBufferByteLength');
var IsDetachedBuffer = require('./IsDetachedBuffer');

var dataViewBuffer = require('data-view-buffer');
var isDataView = require('is-data-view');

var Enum = require('../helpers/enum');

var seqCST = Enum.define('SEQ-CST');
var unordered = Enum.define('UNORDERED');
var orders = [seqCST, unordered];

// https://262.ecma-international.org/15.0/#sec-makedataviewwithbufferwitnessrecord

module.exports = function MakeDataViewWithBufferWitnessRecord(obj, order) {
	if (!isDataView(obj)) {
		throw new $TypeError('MakeDataViewWithBufferWitnessRecord called with non-DataView');
	}
	Enum.validate('order', orders, order);

	var buffer = dataViewBuffer(obj); // step 1

	var byteLength = IsDetachedBuffer(buffer) ? 'DETACHED' : ArrayBufferByteLength(buffer, order); // steps 2 - 3

	return { '[[Object]]': obj, '[[CachedBufferByteLength]]': byteLength }; // step 4
};

'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

var specEnum = require('../../helpers/specEnum');

module.exports = function (t, year, GetArrayBufferMaxByteLengthOption) {
	t.ok(year >= 2024, 'ES2024+');

	var empty = specEnum(year, 'empty');

	forEach(v.primitives, function (nonObject) {
		t.equal(GetArrayBufferMaxByteLengthOption(nonObject), empty, debug(nonObject) + ' is not an Object, returns ~EMPTY~');
	});

	t.equal(GetArrayBufferMaxByteLengthOption({}), empty, 'absent `maxByteLength` yields ~EMPTY~');
	t.equal(GetArrayBufferMaxByteLengthOption({ maxByteLength: undefined }), empty, 'undefined `maxByteLength` yields ~EMPTY~');

	t.equal(GetArrayBufferMaxByteLengthOption({ maxByteLength: 42 }), 42, '42 `maxByteLength` yields 42');
	t.equal(GetArrayBufferMaxByteLengthOption({ maxByteLength: { valueOf: function () { return 42; } } }), 42, 'valueOf -> 42 `maxByteLength` yields 42');
};

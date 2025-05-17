'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

module.exports = function (t, year, GetArrayBufferMaxByteLengthOption) {
	t.ok(year >= 2024, 'ES2024+');

	forEach(v.primitives, function (nonObject) {
		t.equal(GetArrayBufferMaxByteLengthOption(nonObject), 'EMPTY', debug(nonObject) + ' is not an Object, returns ~EMPTY~');
	});

	t.equal(GetArrayBufferMaxByteLengthOption({}), 'EMPTY', 'absent `maxByteLength` yields ~EMPTY~');
	t.equal(GetArrayBufferMaxByteLengthOption({ maxByteLength: undefined }), 'EMPTY', 'undefined `maxByteLength` yields ~EMPTY~');

	t.equal(GetArrayBufferMaxByteLengthOption({ maxByteLength: 42 }), 42, '42 `maxByteLength` yields 42');
	t.equal(GetArrayBufferMaxByteLengthOption({ maxByteLength: { valueOf: function () { return 42; } } }), 42, 'valueOf -> 42 `maxByteLength` yields 42');
};

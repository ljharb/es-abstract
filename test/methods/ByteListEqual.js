'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, ByteListEqual) {
	t.ok(year >= 2021, 'ES2021+');

	forEach(v.nonArrays, function (nonArray) {
		t['throws'](
			function () { ByteListEqual(nonArray); },
			TypeError,
			'xBytes: ' + debug(nonArray) + ' is not a sequence of byte values'
		);

		t['throws'](
			function () { ByteListEqual([], nonArray); },
			TypeError,
			'yBytes: ' + debug(nonArray) + ' is not a sequence of byte values'
		);
	});

	t.equal(ByteListEqual([0], [0, 0]), false, 'two sequences of different length are not equal');

	forEach([1.5, -1, 256], function (nonByte) {
		t['throws'](
			function () { ByteListEqual([nonByte], [1]); },
			TypeError,
			debug(nonByte) + ' is not a byte value'
		);
	});

	for (var i = 0; i <= 255; i += 1) {
		t.equal(ByteListEqual([i], [i]), true, 'two equal sequences of ' + i + ' are equal');
		t.equal(ByteListEqual([i, i === 0 ? 1 : 0], [i === 0 ? 1 : 0, i]), false, 'two inequal sequences of ' + i + ' are not equal');
	}
};

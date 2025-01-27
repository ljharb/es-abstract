'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var Enum = require('../../helpers/enum');

module.exports = function (t, year, ByteListBitwiseOp) {
	t.ok(year >= 2021, 'ES2021+');

	t['throws'](
		function () { ByteListBitwiseOp('+', [], []); },
		TypeError,
		'op must be &, ^, or |'
	);

	forEach(['&', Enum('&')], function (amp) {
		forEach(v.nonArrays, function (nonArray) {
			t['throws'](
				function () { ByteListBitwiseOp(amp, nonArray); },
				TypeError,
				'xBytes: ' + debug(nonArray) + ' is not a sequence of byte values'
			);

			t['throws'](
				function () { ByteListBitwiseOp(amp, [], nonArray); },
				TypeError,
				'yBytes: ' + debug(nonArray) + ' is not a sequence of byte values'
			);
		});

		t['throws'](
			function () { ByteListBitwiseOp(amp, [0], [0, 0]); },
			TypeError,
			'byte sequences must be the same length'
		);

		forEach([1.5, -1, 256], function (nonByte) {
			t['throws'](
				function () { ByteListBitwiseOp(amp, [nonByte], [1]); },
				TypeError,
				debug(nonByte) + ' is not a byte value'
			);
		});
	});

	for (var i = 0; i <= 255; i += 1) {
		var j = i === 0 ? 1 : i - 1;
		/* eslint no-loop-func: 0 */
		forEach(['&', Enum('&')], function (amp) {
			t.deepEqual(ByteListBitwiseOp(amp, [i], [j]), [i & j], i + ' & ' + j);
		});
		forEach(['^', Enum('^')], function (caret) {
			t.deepEqual(ByteListBitwiseOp(caret, [i], [j]), [i ^ j], i + ' ^ ' + j);
		});
		forEach(['|', Enum('|')], function (pipe) {
			t.deepEqual(ByteListBitwiseOp(pipe, [i], [j]), [i | j], i + ' | ' + j);
		});
	}
};

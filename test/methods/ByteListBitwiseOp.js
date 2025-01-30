'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'ByteListBitwiseOp'>} */
module.exports = function (t, year, ByteListBitwiseOp) {
	t.ok(year >= 2021, 'ES2021+');

	t['throws'](
		// @ts-expect-error
		function () { ByteListBitwiseOp('+', [], []); },
		TypeError,
		'op must be &, ^, or |'
	);

	forEach(v.nonArrays, function (nonArray) {
		t['throws'](
			// @ts-expect-error
			function () { ByteListBitwiseOp('&', nonArray); },
			TypeError,
			'xBytes: ' + debug(nonArray) + ' is not a sequence of byte values'
		);

		t['throws'](
			// @ts-expect-error
			function () { ByteListBitwiseOp('&', [], nonArray); },
			TypeError,
			'yBytes: ' + debug(nonArray) + ' is not a sequence of byte values'
		);
	});

	t['throws'](
		function () { ByteListBitwiseOp('&', [0], [0, 0]); },
		TypeError,
		'byte sequences must be the same length'
	);

	forEach([1.5, -1, 256], function (nonByte) {
		t['throws'](
			// @ts-expect-error
			function () { ByteListBitwiseOp('&', [nonByte], [1]); },
			TypeError,
			debug(nonByte) + ' is not a byte value'
		);
	});

	for (var i = 0; i <= 255; i += 1) {
		var j = /** @type {import('../../types').ByteValue} */ (i === 0 ? 1 : i - 1);
		/* eslint array-bracket-spacing: 0 */ // eslint has a bug with this rule's autofix
		t.deepEqual(ByteListBitwiseOp('&', [/** @type {import('../../types').ByteValue} */ (i)], [j]), [i & j], i + ' & ' + j);
		t.deepEqual(ByteListBitwiseOp('^', [/** @type {import('../../types').ByteValue} */ (i)], [j]), [i ^ j], i + ' ^ ' + j);
		t.deepEqual(ByteListBitwiseOp('|', [/** @type {import('../../types').ByteValue} */ (i)], [j]), [i | j], i + ' | ' + j);
	}
};

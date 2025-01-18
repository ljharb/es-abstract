'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'ByteListEqual'>} */
module.exports = function (t, year, ByteListEqual) {
	t.ok(year >= 2021, 'ES2021+');

	forEach(v.nonArrays, function (nonArray) {
		t['throws'](
			// @ts-expect-error
			function () { ByteListEqual(nonArray); },
			TypeError,
			'xBytes: ' + debug(nonArray) + ' is not a sequence of byte values'
		);

		t['throws'](
			// @ts-expect-error
			function () { ByteListEqual([], nonArray); },
			TypeError,
			'yBytes: ' + debug(nonArray) + ' is not a sequence of byte values'
		);
	});

	t.equal(ByteListEqual([0], [0, 0]), false, 'two sequences of different length are not equal');

	forEach([1.5, -1, 256], function (nonByte) {
		t['throws'](
			// @ts-expect-error
			function () { ByteListEqual([nonByte], [1]); },
			TypeError,
			debug(nonByte) + ' is not a byte value'
		);
	});

	for (var i = 0; i <= 255; i += 1) {
		t.equal(
			ByteListEqual(
				[
					/** @type {import('../../types').ByteValue} */ (i)
				],
				[
					/** @type {import('../../types').ByteValue} */ (i)
				]
			),
			true,
			'two equal sequences of ' + i + ' are equal'
		);
		t.equal(
			ByteListEqual(
				[
					/** @type {import('../../types').ByteValue} */ (i),
					i === 0 ? 1 : 0
				],
				[i === 0 ? 1 : 0, /** @type {import('../../types').ByteValue} */ (i)]
			),
			false,
			'two inequal sequences of ' + i + ' are not equal'
		);
	}
};

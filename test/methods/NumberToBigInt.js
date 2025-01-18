'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'NumberToBigInt'>} */
module.exports = function (t, year, NumberToBigInt) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			// @ts-expect-error
			function () { NumberToBigInt(nonNumber); },
			TypeError,
			debug(nonNumber) + ' is not a Number'
		);
	});

	forEach(v.nonIntegerNumbers, function (nonIntegerNumber) {
		t['throws'](
			function () { NumberToBigInt(nonIntegerNumber); },
			RangeError,
			debug(nonIntegerNumber) + ' is not an integer'
		);
	});

	t.test('actual BigInts', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.integerNumbers, function (int) {
			if (int >= 1e17) {
				// BigInt(1e17) throws on node v10.4 - v10.8
				try {
					st.equal(NumberToBigInt(int), BigInt(int), debug(int) + ' becomes ' + debug(BigInt(int)));
				} catch (e) {
					st['throws'](
						function () { BigInt(int); },
						RangeError,
						debug(int) + ' is too large on this engine to convert into a BigInt'
					);
				}
			} else {
				st.equal(NumberToBigInt(int), BigInt(int), debug(int) + ' becomes ' + debug(BigInt(int)));
			}
		});
		st.end();
	});

	t.test('no BigInts', { skip: esV.hasBigInts }, function (st) {
		st['throws'](
			function () { NumberToBigInt(0); },
			SyntaxError,
			'BigInt is not supported on this engine'
		);

		st.end();
	});
};

'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var Enum = require('../../helpers/enum');

var esV = require('../helpers/v');

module.exports = function (t, year, BigIntBitwiseOp) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.numbers, function (number) {
		forEach(['&', Enum('&')], function (amp) {
			t['throws'](
				function () { BigIntBitwiseOp(amp, number, number); },
				TypeError,
				debug(number) + ' is not a BigInt'
			);
		});
	});

	t.test('BigInt support', { skip: !esV.hasBigInts }, function (st) {
		forEach(['&', Enum('&')], function (amp) {
			st['throws'](
				function () { BigIntBitwiseOp(amp, 1, BigInt(1)); },
				TypeError,
				'x: 1 is not a BigInt'
			);
			st['throws'](
				function () { BigIntBitwiseOp(amp, BigInt(1), 1); },
				TypeError,
				'y: 1 is not a BigInt'
			);
		});

		st['throws'](
			function () { BigIntBitwiseOp('invalid', BigInt(0), BigInt(0)); },
			TypeError,
			'throws with an invalid op'
		);

		forEach(['&', Enum('&')], function (amp) {
			st.equal(BigIntBitwiseOp(amp, BigInt(1), BigInt(2)), BigInt(1) & BigInt(2));
		});
		forEach(['|', Enum('|')], function (pipe) {
			st.equal(BigIntBitwiseOp(pipe, BigInt(1), BigInt(2)), BigInt(1) | BigInt(2));
		});
		forEach(['^', Enum('^')], function (caret) {
			st.equal(BigIntBitwiseOp(caret, BigInt(1), BigInt(2)), BigInt(1) ^ BigInt(2));
		});

		st.end();
	});
};

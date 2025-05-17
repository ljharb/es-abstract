'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var safeBigInt = require('safe-bigint');

var esV = require('../helpers/v');

module.exports = function (t, year, ToBigInt) {
	t.ok(year >= 2020, 'ES2020+');

	forEach([].concat(
		v.nullPrimitives,
		v.symbols,
		v.numbers
	), function (nonBigIntCoercible) {
		t['throws'](
			function () { ToBigInt(nonBigIntCoercible); },
			esV.hasBigInts ? TypeError : SyntaxError,
			debug(nonBigIntCoercible) + ' throws'
		);
	});

	forEach(v.symbols, function (sym) {
		t['throws'](
			function () { ToBigInt(sym); },
			esV.hasBigInts ? TypeError : SyntaxError,
			debug(sym) + ' throws'
		);
	});

	t.test('actual BigInts', { skip: !esV.hasBigInts }, function (st) {
		st.equal(ToBigInt(true), BigInt(1), 'true becomes 1n');
		st.equal(ToBigInt(false), BigInt(0), 'true becomes 0n');

		st.equal(ToBigInt(''), BigInt(0), 'empty string becomes 0n');
		st['throws'](
			function () { ToBigInt('a'); },
			TypeError,
			debug('a') + ' can not be parsed to a bigint'
		);

		forEach(v.bigints, function (bigint) {
			st.equal(
				ToBigInt(bigint),
				bigint,
				debug(bigint) + ' remains ' + debug(bigint)
			);

			st.equal(
				ToBigInt(String(bigint)),
				bigint,
				debug(String(bigint)) + ' becomes ' + debug(bigint)
			);
		});

		forEach(v.numbers, function (number) {
			st['throws'](
				function () { ToBigInt(number); },
				TypeError,
				debug(number) + ' throws'
			);
		});

		forEach(v.integerNumbers, function (int) {
			st.equal(
				ToBigInt(String(int)),
				safeBigInt(int),
				debug(String(int)) + ' becomes ' + debug(safeBigInt(int))
			);
		});

		forEach(v.nonIntegerNumbers, function (nonInt) {
			st['throws'](
				function () { ToBigInt(nonInt); },
				TypeError,
				debug(nonInt) + ' is not an integer'
			);
		});

		st.end();
	});
};

'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var safeBigInt = require('safe-bigint');

var esV = require('../helpers/v');

module.exports = function (t, year, StringToBigInt) {
	t.ok(year >= 2020, 'ES2020+');

	t.test('actual BigInts', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.bigints, function (bigint) {
			st.equal(
				StringToBigInt(String(bigint)),
				bigint,
				debug(String(bigint)) + ' becomes ' + debug(bigint)
			);
		});

		forEach(v.integerNumbers, function (int) {
			var bigint = safeBigInt(int);
			st.equal(
				StringToBigInt(String(int)),
				bigint,
				debug(String(int)) + ' becomes ' + debug(bigint)
			);
		});

		var expected = year >= 2022 ? undefined : NaN;

		forEach(v.nonIntegerNumbers, function (nonInt) {
			st.equal(
				StringToBigInt(String(nonInt)),
				expected,
				debug(String(nonInt)) + ' becomes ' + expected
			);
		});

		st.equal(StringToBigInt(''), BigInt(0), 'empty string becomes 0n');
		st.equal(StringToBigInt('Infinity'), expected, 'non-finite numeric string becomes ' + expected);

		st.end();
	});

	t.test('BigInt not supported', { skip: esV.hasBigInts }, function (st) {
		st['throws'](
			function () { StringToBigInt('0'); },
			SyntaxError,
			'throws a SyntaxError when BigInt is not available'
		);

		st.end();
	});

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			function () { StringToBigInt(nonString); },
			TypeError,
			debug(nonString) + ' is not a string'
		);
	});
};

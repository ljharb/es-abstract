'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

var esV = require('../helpers/v');

var testStringToNumber = require('./StringToNumber');

/** @type {import('../testHelpers').MethodTest<'ToNumber'>} */
module.exports = function (t, year, ToNumber, extras) {
	t.ok(year >= 5, 'ES5+');

	var ToPrimitive = extras.getAO('ToPrimitive');

	t.equal(NaN, ToNumber(undefined), 'undefined coerces to NaN');
	t.equal(ToNumber(null), 0, 'null coerces to +0');
	t.equal(ToNumber(false), 0, 'false coerces to +0');
	t.equal(1, ToNumber(true), 'true coerces to 1');

	t.test('numbers', function (st) {
		st.equal(NaN, ToNumber(NaN), 'NaN returns itself');

		forEach(/** @type {number[]} */ ([].concat(
			// @ts-expect-error TS sucks with concat
			v.zeroes,
			v.infinities,
			42
		)), function (num) {
			st.equal(num, ToNumber(num), num + ' returns itself');
		});

		forEach(['foo', '0', '4a', '2.0', 'Infinity', '-Infinity'], function (numString) {
			st.equal(+numString, ToNumber(numString), '"' + numString + '" coerces to ' + Number(numString));
		});

		st.end();
	});

	t.test('objects', function (st) {
		forEach(v.objects, function (object) {
			st.equal(
				ToNumber(object),
				ToNumber(ToPrimitive(object)),
				'object ' + object + ' coerces to same as ToPrimitive of object does'
			);
		});

		st['throws'](
			function () { return ToNumber(v.uncoercibleObject); },
			TypeError,
			'uncoercibleObject throws'
		);

		st.end();
	});

	t.test('signed hex numbers', function (st) {
		st.equal(ToNumber('-0xF'), NaN, '-0xF is NaN');
		st.equal(ToNumber(' -0xF '), NaN, 'space-padded -0xF is NaN');
		st.equal(ToNumber('+0xF'), NaN, '+0xF is NaN');
		st.equal(ToNumber(' +0xF '), NaN, 'space-padded +0xF is NaN');

		st.end();
	});

	t.test('dates', function (st) {
		var invalid = new Date(NaN);
		st.equal(ToNumber(invalid), NaN, 'invalid Date coerces to NaN');

		var now = +new Date();
		st.equal(ToNumber(new Date(now)), now, 'Date coerces to timestamp');

		st.end();
	});

	t.equal(NaN, ToNumber(undefined), 'undefined coerces to NaN');
	t.equal(ToNumber(null), 0, 'null coerces to +0');
	t.equal(ToNumber(false), 0, 'false coerces to +0');
	t.equal(1, ToNumber(true), 'true coerces to 1');

	t.test('binary literals', function (st) {
		var expected0b10 = year < 2015 ? NaN : 2;
		st.equal(ToNumber('0b10'), expected0b10, '0b10 is ' + expected0b10);

		var expected0b11 = year < 2015 ? NaN : 3;
		st.equal(ToNumber({ toString: function () { return '0b11'; } }), expected0b11, 'Object that toStrings to 0b11 is ' + expected0b11);

		st.equal(ToNumber('0b12'), NaN, '0b12 is NaN');
		st.equal(ToNumber({ toString: function () { return '0b112'; } }), NaN, 'Object that toStrings to 0b112 is NaN');
		st.end();
	});

	t.test('octal literals', function (st) {
		var expected0o10 = year < 2015 ? NaN : 8;
		st.equal(ToNumber('0o10'), expected0o10, '0o10 is ' + expected0o10);

		var expected0o11 = year < 2015 ? NaN : 9;
		st.equal(ToNumber({ toString: function () { return '0o11'; } }), expected0o11, 'Object that toStrings to 0o11 is ' + expected0o11);

		st.equal(ToNumber('0o18'), NaN, '0o18 is NaN');
		st.equal(ToNumber({ toString: function () { return '0o118'; } }), NaN, 'Object that toStrings to 0o118 is NaN');
		st.end();
	});

	testStringToNumber(
		t,
		year,
		/** @param {unknown} x */ function (x) {
			if (typeof x !== 'string') {
				throw new TypeError('covering the throw behavior of StringToNumber');
			}
			return ToNumber(x);
		},
		extras
	);

	if (year >= 2015) {
		forEach(v.symbols, function (symbol) {
			t['throws'](
				// @ts-expect-error
				function () { ToNumber(symbol); },
				TypeError,
				'Symbols can’t be converted to a Number: ' + debug(symbol)
			);

			/** @type {Symbol} */
			var boxed = Object(symbol);
			t['throws'](
				function () { ToNumber(boxed); },
				TypeError,
				'boxed Symbols can’t be converted to a Number: ' + debug(boxed)
			);
		});
	}

	if (year >= 2020) {
		t.test('bigints', { skip: !esV.hasBigInts }, function (st) {
			forEach(v.bigints, function (bigInt) {
				st['throws'](
					// @ts-expect-error
					function () { ToNumber(bigInt); },
					TypeError,
					'ToNumber of ' + debug(bigInt) + ' throws'
				);

				/** @type {BigInt} */
				var boxed = Object(bigInt);
				st['throws'](
					function () { ToNumber(boxed); },
					TypeError,
					'ToNumber of ' + debug(boxed) + ' throws'
				);
			});

			st.end();
		});
	}
};

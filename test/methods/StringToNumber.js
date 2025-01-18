'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

/** @type {import('../testHelpers').MethodTest<'StringToNumber' | 'ToNumber'>} */
module.exports = function (t, year, StringToNumber) {
	t.ok(year >= 5, 'ES5+'); // this is ES2022+, but ToNumber calls it as well

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			// @ts-expect-error
			function () { StringToNumber(nonString); },
			TypeError,
			debug(nonString) + ' is not a String'
		);
	});

	t.test('trimming of whitespace and non-whitespace characters', function (st) {
		// Zero-width space (zws), next line character (nel), and non-character (bom) are not whitespace.
		var nonWhitespaces = {
			'\\u200b': '\u200b',
			'\\ufffe': '\ufffe'
		};

		forEach(nonWhitespaces, function (desc, nonWS) {
			st.equal(StringToNumber(nonWS + 0 + nonWS), NaN, 'non-whitespace ' + desc + ' not trimmed');
		});

		st.end();
	});

	// TODO: check if this applies to ES5
	t.test('trimming of whitespace and non-whitespace characters', function (st) {
		var whitespace = year < 2015
			? ' \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u0085'
			: ' \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000';

		if ((/\s/).test('\u180e')) {
			whitespace += '\u180e'; // in node 8.3+, the mongolian vowel separator is not whitespace
		}

		forEach(whitespace, function (ws) {
			st.equal(StringToNumber(ws + 0 + ws), 0, 'whitespace ' + debug(ws) + ' is trimmed');
		});

		st.equal(StringToNumber(whitespace + 0 + whitespace), 0, 'whitespace is trimmed');

		// Zero-width space (zws), next line character (nel), and non-character (bom) are not whitespace.
		var nonWhitespaces = year < 2015
			? {
				'\\u200b': '\u200b',
				'\\ufffe': '\ufffe'
			}
			: {
				'\\u0085': '\u0085',
				'\\u200b': '\u200b',
				'\\ufffe': '\ufffe'
			};

		forEach(nonWhitespaces, function (desc, nonWS) {
			st.equal(StringToNumber(nonWS + 0 + nonWS), NaN, 'non-whitespace ' + desc + ' not trimmed');
		});

		st.end();
	});

	t.test('stringified numbers', function (st) {
		forEach(['foo', '0', '4a', '2.0', 'Infinity', '-Infinity'], function (numString) {
			st.equal(+numString, StringToNumber(numString), '"' + numString + '" coerces to ' + Number(numString));
		});

		forEach(v.numbers, function (number) {
			var str = number === 0 ? debug(number) : String(number);
			st.equal(StringToNumber(str), number, debug(number) + ' stringified, coerces to itself');
		});

		st.end();
	});
};

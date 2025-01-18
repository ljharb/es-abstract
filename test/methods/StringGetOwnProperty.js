'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'StringGetOwnProperty'>} */
module.exports = function (t, year, StringGetOwnProperty) {
	t.ok(year >= 2017, 'ES2017+');

	forEach(/** @type {unknown[]} */ ([].concat(
		// @ts-expect-error TS sucks with concat
		v.nonStrings,
		v.strings
	)), function (nonBoxedString) {
		t['throws'](
			// @ts-expect-error
			function () { StringGetOwnProperty(nonBoxedString, '0'); },
			TypeError,
			debug(nonBoxedString) + ' is not a boxed String'
		);
	});
	forEach(v.nonPropertyKeys, function (nonPropertyKey) {
		t['throws'](
			// @ts-expect-error
			function () { StringGetOwnProperty(Object(''), nonPropertyKey); },
			TypeError,
			debug(nonPropertyKey) + ' is not a Property Key'
		);
	});

	t.equal(StringGetOwnProperty(Object(''), '0'), undefined, 'empty boxed string yields undefined');

	forEach(v.symbols, function (symbol) {
		t.equal(
			// @ts-expect-error
			StringGetOwnProperty(Object('abc'), symbol),
			undefined,
			debug(symbol) + ' is not a String, and yields undefined'
		);
	});

	forEach(v.strings, function (string) {
		if (string) {
			var S = Object(string);
			for (var i = 0; i < string.length; i += 1) {
				var descriptor = StringGetOwnProperty(S, /** @type {`${typeof i}`} */ (String(i)));
				t.deepEqual(
					descriptor,
					{
						'[[Configurable]]': false,
						'[[Enumerable]]': true,
						'[[Value]]': string.charAt(i),
						'[[Writable]]': false
					},
					debug(string) + ': property ' + debug(String(i)) + ': returns expected descriptor'
				);
			}
		}
	});
};

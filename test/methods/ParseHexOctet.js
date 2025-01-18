'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'ParseHexOctet'>} */
module.exports = function (t, year, ParseHexOctet, extras) {
	t.ok(year >= 2023, 'ES2023+');

	var StringPad = extras.getAO('StringPad');

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			// @ts-expect-error
			function () { ParseHexOctet(nonString, 0); },
			TypeError,
			debug(nonString) + ' is not a String'
		);
	});

	forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
		t['throws'](
			function () { ParseHexOctet('', nonNonNegativeInteger); },
			TypeError,
			debug(nonNonNegativeInteger) + ' is not a non-negative integer'
		);
	});

	var str = 'abc';
	t.deepEqual(
		ParseHexOctet(str, str.length - 1),
		[new SyntaxError('requested a position on a string that does not contain 2 characters at that position')],
		'"position + 2" is not a valid index into the string'
	);

	t.deepEqual(
		ParseHexOctet('0gx', 0),
		[new SyntaxError('Invalid hexadecimal characters')],
		'invalid hex characters return an array with an error'
	);

	for (var i = 0; i < 256; i += 1) {
		var hex = StringPad(i.toString(16), 2, '0', 'start');
		t.equal(ParseHexOctet(hex, 0), i, debug(hex) + ' parses to ' + i);
		t.equal(ParseHexOctet('0' + hex, 1), i, '0' + debug(hex) + ' at position 1 parses to ' + i);
	}
};

'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'UTF16EncodeCodePoint'>} */
module.exports = function (t, year, UTF16EncodeCodePoint) {
	t.ok(year >= 2016, 'ES2016+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			// @ts-expect-error
			function () { UTF16EncodeCodePoint(nonNumber); },
			TypeError,
			debug(nonNumber) + ' is not a Number'
		);
	});

	t['throws'](
		function () { UTF16EncodeCodePoint(-1); },
		TypeError,
		'-1 is < 0'
	);

	t['throws'](
		function () { UTF16EncodeCodePoint(0x10FFFF + 1); },
		TypeError,
		'0x10FFFF + 1 is > 0x10FFFF'
	);

	t.equal(UTF16EncodeCodePoint(0xD83D), esV.poo.leading, '0xD83D is the first half of ' + esV.poo.whole);
	t.equal(UTF16EncodeCodePoint(0xDCA9), esV.poo.trailing, '0xDCA9 is the last half of ' + esV.poo.whole);
	t.equal(UTF16EncodeCodePoint(0x1F4A9), esV.poo.whole, '0xDCA9 is the last half of ' + esV.poo.whole);
	t.equal(UTF16EncodeCodePoint(0x10000), '𐀀', '0x10000 is "𐀀"');
};

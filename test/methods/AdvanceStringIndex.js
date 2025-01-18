'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'AdvanceStringIndex'>} */
module.exports = function (t, year, AdvanceStringIndex) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			// @ts-expect-error
			function () { AdvanceStringIndex(nonString); },
			TypeError,
			'"S" argument must be a String; ' + debug(nonString) + ' is not'
		);
	});

	forEach(esV.notInts, function (nonInt) {
		t['throws'](
			// @ts-expect-error
			function () { AdvanceStringIndex('abc', nonInt); },
			TypeError,
			'"index" argument must be an integer, ' + debug(nonInt) + ' is not.'
		);
	});

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			// @ts-expect-error
			function () { AdvanceStringIndex('abc', 0, nonBoolean); },
			TypeError,
			debug(nonBoolean) + ' is not a Boolean'
		);
	});

	var str = 'a' + esV.poo.whole + 'c';

	t.test('non-unicode mode', function (st) {
		for (var i = 0; i < str.length + 2; i += 1) {
			st.equal(AdvanceStringIndex(str, i, false), i + 1, i + ' advances to ' + (i + 1));
		}

		st.end();
	});

	t.test('unicode mode', function (st) {
		st.equal(AdvanceStringIndex(str, 0, true), 1, '0 advances to 1');
		st.equal(AdvanceStringIndex(str, 1, true), 3, '1 advances to 3');
		st.equal(AdvanceStringIndex(str, 2, true), 3, '2 advances to 3');
		st.equal(AdvanceStringIndex(str, 3, true), 4, '3 advances to 4');
		st.equal(AdvanceStringIndex(str, 4, true), 5, '4 advances to 5');

		st.end();
	});

	t.test('lone surrogates', function (st) {
		var halfPoo = 'a' + esV.poo.leading + 'c';

		st.equal(AdvanceStringIndex(halfPoo, 0, true), 1, '0 advances to 1');
		st.equal(AdvanceStringIndex(halfPoo, 1, true), 2, '1 advances to 2');
		st.equal(AdvanceStringIndex(halfPoo, 2, true), 3, '2 advances to 3');
		st.equal(AdvanceStringIndex(halfPoo, 3, true), 4, '3 advances to 4');

		st.end();
	});

	t.test('surrogate pairs', function (st) {
		var lowestPair = String.fromCharCode(0xD800) + String.fromCharCode(0xDC00);
		var highestPair = String.fromCharCode(0xDBFF) + String.fromCharCode(0xDFFF);

		st.equal(AdvanceStringIndex(lowestPair, 0, true), 2, 'lowest surrogate pair, 0 -> 2');
		st.equal(AdvanceStringIndex(highestPair, 0, true), 2, 'highest surrogate pair, 0 -> 2');
		st.equal(AdvanceStringIndex(esV.poo.whole, 0, true), 2, 'poop, 0 -> 2');

		st.end();
	});
};

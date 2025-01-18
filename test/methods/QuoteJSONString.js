'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'QuoteJSONString'>} */
module.exports = function (t, year, QuoteJSONString) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			// @ts-expect-error
			function () { QuoteJSONString(nonString); },
			TypeError,
			debug(nonString) + ' is not a String'
		);
	});

	t.equal(QuoteJSONString(''), '""', '"" gets properly JSON-quoted');
	t.equal(QuoteJSONString('a'), '"a"', '"a" gets properly JSON-quoted');
	t.equal(QuoteJSONString('"'), '"\\""', '"\\"" gets properly JSON-quoted');
	t.equal(QuoteJSONString('\b'), '"\\b"', '"\\b" gets properly JSON-quoted');
	t.equal(QuoteJSONString('\t'), '"\\t"', '"\\t" gets properly JSON-quoted');
	t.equal(QuoteJSONString('\n'), '"\\n"', '"\\n" gets properly JSON-quoted');
	t.equal(QuoteJSONString('\f'), '"\\f"', '"\\f" gets properly JSON-quoted');
	t.equal(QuoteJSONString('\r'), '"\\r"', '"\\r" gets properly JSON-quoted');
	t.equal(QuoteJSONString('\\'), '"\\\\"', '"\\\\" gets properly JSON-quoted');
	t.equal(QuoteJSONString('\\'), '"\\\\"', '"\\\\" gets properly JSON-quoted');
	t.equal(QuoteJSONString('\u000B'), '"\\u000b"', '"\\u000B" gets properly JSON-quoted');
	t.equal(QuoteJSONString('\u0019'), '"\\u0019"', '"\\u0019" gets properly JSON-quoted');

	if (year < 2019) {
		t.equal(QuoteJSONString(esV.poo.leading), '"\ud83d"', 'leading poo gets properly JSON-quoted');
		t.equal(QuoteJSONString(esV.poo.trailing), '"\udca9"', 'trailing poo gets properly JSON-quoted');
		t.equal(QuoteJSONString(esV.poo.whole), '"\ud83d\udca9"', 'whole poo gets properly JSON-quoted');
	} else {
		t.equal(QuoteJSONString(esV.poo.leading), '"\\ud83d"', 'leading poo gets properly JSON-quoted');
		t.equal(QuoteJSONString(esV.poo.trailing), '"\\udca9"', 'trailing poo gets properly JSON-quoted');
		t.equal(QuoteJSONString(esV.poo.whole), '"\\ud83d\\udca9"', 'whole poo gets properly JSON-quoted');
	}
};

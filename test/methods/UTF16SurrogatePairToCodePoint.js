'use strict';

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'UTF16SurrogatePairToCodePoint'>} */
module.exports = function (t, year, UTF16SurrogatePairToCodePoint) {
	t.ok(year >= 2016, 'ES2016+');

	t['throws'](
		function () { UTF16SurrogatePairToCodePoint('a'.charCodeAt(0), esV.poo.trailing.charCodeAt(0)); },
		TypeError,
		'"a" is not a leading surrogate'
	);
	t['throws'](
		function () { UTF16SurrogatePairToCodePoint(esV.poo.leading.charCodeAt(0), 'b'.charCodeAt(0)); },
		TypeError,
		'"b" is not a trailing surrogate'
	);

	t.equal(UTF16SurrogatePairToCodePoint(esV.poo.leading.charCodeAt(0), esV.poo.trailing.charCodeAt(0)), esV.poo.whole);
};

'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var defineProperty = require('../helpers/defineProperty');
var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'IsRegExp'>} */
module.exports = function (t, year, IsRegExp) {
	t.ok(year >= 2015, 'ES2015+');

	forEach([/a/g, new RegExp('a', 'g')], function (regex) {
		t.equal(true, IsRegExp(regex), regex + ' is regex');
	});

	forEach(esV.unknowns, function (nonRegex) {
		t.equal(false, IsRegExp(nonRegex), debug(nonRegex) + ' is not regex');
	});

	t.test('Symbol.match', { skip: !v.hasSymbols || !Symbol.match }, function (st) {
		/** @type {Record<PropertyKey, unknown>>} */
		var obj = {};
		obj[Symbol.match] = true;
		st.equal(true, IsRegExp(obj), 'object with truthy Symbol.match is regex');

		var regex = /a/;
		defineProperty(/** @type {Parameters<typeof defineProperty>[0]} */ (/** @type {unknown} */ (regex)), Symbol.match, { value: false });
		st.equal(false, IsRegExp(regex), 'regex with falsy Symbol.match is not regex');

		st.end();
	});
};

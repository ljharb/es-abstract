'use strict';

var v = require('es-value-fixtures');

module.exports = function (t, year, Type) {
	t.ok(year >= 5, 'ES5+');

	t.equal(Type(), 'Undefined', 'Type() is Undefined');
	t.equal(Type(undefined), 'Undefined', 'Type(undefined) is Undefined');
	t.equal(Type(null), 'Null', 'Type(null) is Null');
	t.equal(Type(true), 'Boolean', 'Type(true) is Boolean');
	t.equal(Type(false), 'Boolean', 'Type(false) is Boolean');
	t.equal(Type(0), 'Number', 'Type(0) is Number');
	t.equal(Type(NaN), 'Number', 'Type(NaN) is Number');
	t.equal(Type('abc'), 'String', 'Type("abc") is String');
	t.equal(Type(function () {}), 'Object', 'Type(function () {}) is Object');
	t.equal(Type({}), 'Object', 'Type({}) is Object');

	if (year >= 2015) {
		t.test('symbols', { skip: !v.hasSymbols }, function (st) {
			st.equal(Type(Symbol.iterator), 'Symbol', 'Type(Symbol.iterator) is Symbol');

			st.end();
		});
	}
};

'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var $getProto = require('get-proto');

module.exports = function (t, year, OrdinaryGetPrototypeOf) {
	t.ok(year >= 2016, 'ES2016+');

	t.test('values', { skip: !$getProto }, function (st) {
		st.equal(OrdinaryGetPrototypeOf([]), Array.prototype, 'array [[Prototype]] is Array.prototype');
		st.equal(OrdinaryGetPrototypeOf({}), Object.prototype, 'object [[Prototype]] is Object.prototype');
		st.equal(OrdinaryGetPrototypeOf(/a/g), RegExp.prototype, 'regex [[Prototype]] is RegExp.prototype');
		st.equal(OrdinaryGetPrototypeOf(Object('')), String.prototype, 'boxed string [[Prototype]] is String.prototype');
		st.equal(OrdinaryGetPrototypeOf(Object(42)), Number.prototype, 'boxed number [[Prototype]] is Number.prototype');
		st.equal(OrdinaryGetPrototypeOf(Object(true)), Boolean.prototype, 'boxed boolean [[Prototype]] is Boolean.prototype');
		if (v.hasSymbols) {
			st.equal(OrdinaryGetPrototypeOf(Object(Symbol.iterator)), Symbol.prototype, 'boxed symbol [[Prototype]] is Symbol.prototype');
		}
		st.end();
	});

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { OrdinaryGetPrototypeOf(primitive); },
			TypeError,
			debug(primitive) + ' is not an Object'
		);
	});
};

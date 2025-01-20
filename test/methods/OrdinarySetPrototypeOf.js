'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var $getProto = require('get-proto');

module.exports = function (t, year, OrdinarySetPrototypeOf) {
	t.ok(year >= 2016, 'ES2016+');

	forEach(v.primitives, function (primitive) {
		if (primitive !== null) {
			t['throws'](
				function () { OrdinarySetPrototypeOf({}, primitive); },
				TypeError,
				debug(primitive) + ' is not an Object or null'
			);
		}
	});

	var a = [];
	var proto = {};

	t.equal($getProto(a), Array.prototype, 'precondition');

	t.equal(OrdinarySetPrototypeOf(a, proto), true, 'setting prototype is successful');

	t.equal($getProto(a), proto, 'postcondition');
};

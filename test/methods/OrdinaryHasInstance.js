'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, OrdinaryHasInstance) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonFunctions, function (nonFunction) {
		t.equal(OrdinaryHasInstance(nonFunction, {}), false, debug(nonFunction) + ' is not callable');
	});

	forEach(v.primitives, function (primitive) {
		t.equal(OrdinaryHasInstance(function () {}, primitive), false, debug(primitive) + ' is not an object');
	});

	var C = function C() {};
	var c = new C();
	var D = function D() {};
	t.equal(OrdinaryHasInstance(C, c), true, 'constructor function has an instance of itself');
	t.equal(OrdinaryHasInstance(C, new D()), false, 'constructor/instance mismatch is false');
	t.equal(OrdinaryHasInstance(D, c), false, 'instance/constructor mismatch is false');
	t.equal(OrdinaryHasInstance(C, {}), false, 'plain object is not an instance of a constructor');
	t.equal(OrdinaryHasInstance(Object, {}), true, 'plain object is an instance of Object');

	forEach(v.primitives, function (primitive) {
		C.prototype = primitive;
		t['throws'](
			function () { OrdinaryHasInstance(C, c); },
			TypeError,
			'prototype is ' + debug(primitive)
		);
	});
};

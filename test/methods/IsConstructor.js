'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var hasOwn = require('hasown');

/** @type {import('../testHelpers').MethodTest<'IsConstructor'>} */
module.exports = function (t, year, IsConstructor) {
	t.ok(year >= 2015, 'ES2015+');

	t.equal(true, IsConstructor(function () {}), 'function is constructor');
	t.equal(false, IsConstructor(/a/g), 'regex is not constructor');
	forEach(v.objects, function (object) {
		t.equal(false, IsConstructor(object), object + ' object is not constructor');
	});

	try {
		var arrow = Function('return () => {}')(); // eslint-disable-line no-new-func
		t.equal(IsConstructor(arrow), false, 'arrow function is not constructor');
	} catch (e) {
		t.comment('SKIP: arrow function syntax not supported.');
	}

	try {
		var foo = Function('return class Foo {}')(); // eslint-disable-line no-new-func
		t.equal(IsConstructor(foo), true, 'class is constructor');
	} catch (e) {
		t.comment('SKIP: class syntax not supported.');
	}

	if (typeof Reflect !== 'object' || typeof Proxy !== 'function' || hasOwn(Proxy, 'prototype')) {
		t.comment('SKIP: Proxy is constructor');
	} else {
		t.equal(IsConstructor(Proxy), true, 'Proxy is constructor');
	}
};

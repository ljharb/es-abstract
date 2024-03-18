'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');
var SLOT = require('internal-slot');

module.exports = function (t, year, CreateIteratorFromClosure) {
	t.ok(year >= 2025, 'ES2025+');

	var nonZeroArgClosure = function (_) {}; // eslint-disable-line no-unused-vars
	SLOT.set(nonZeroArgClosure, '[[Sentinel]]', {});
	SLOT.set(nonZeroArgClosure, '[[CloseIfAbrupt]]', function () {});
	t['throws'](
		function () { CreateIteratorFromClosure(nonZeroArgClosure, '', {}); },
		TypeError,
		'"closure" argument must be a zero-argument function'
	);

	var sentinel = {};
	var closure = t.captureFn(function () {});
	SLOT.set(closure, '[[Sentinel]]', sentinel);
	var cIA = t.captureFn(function () {});
	SLOT.set(closure, '[[CloseIfAbrupt]]', cIA);

	forEach(v.nonFunctions, function (nonFunction) {
		t['throws'](
			function () { CreateIteratorFromClosure(nonFunction, '', {}); },
			TypeError,
			debug(nonFunction) + ' is not callable'
		);
	});

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			function () { CreateIteratorFromClosure(closure, nonString, {}); },
			TypeError,
			debug(nonString) + ' is not a string'
		);

		t['throws'](
			function () { CreateIteratorFromClosure(closure, '', {}, ['', nonString]); },
			TypeError,
			'extraSlots: ' + debug(nonString) + ' is not a string'
		);
	});

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { CreateIteratorFromClosure(closure, '', primitive); },
			TypeError,
			debug(primitive) + ' is not an Object'
		);

		SLOT.set(closure, '[[Sentinel]]', primitive);
		t['throws'](
			function () { CreateIteratorFromClosure(closure, '', primitive); },
			TypeError,
			'[[Sentinel]]: ' + debug(primitive) + ' is not an Object'
		);
	});
	SLOT.set(closure, '[[Sentinel]]', sentinel);

	var proto = {};
	var result = CreateIteratorFromClosure(closure, 'test', proto, ['[[a]]', '[[b]]']);
	t.doesNotThrow(function () {
		SLOT.assert(result, '[[Sentinel]]');
		SLOT.assert(result, '[[CloseIfAbrupt]]');
		SLOT.assert(result, '[[a]]');
		SLOT.assert(result, '[[b]]');

		SLOT.assert(result, '[[GeneratorBrand]]');
		SLOT.assert(result, '[[GeneratorState]]');
		SLOT.assert(result, '[[GeneratorContext]]');
	}, 'extra slots are installed');

	t.equal(SLOT.get(result, '[[GeneratorBrand]]'), 'test', 'generator brand is set');

	t.ok(Object.prototype.isPrototypeOf.call(proto, result), 'proto is the [[Prototype]] of the result');

	t.deepEqual(closure.calls, [], 'closure is not called yet');
	t.deepEqual(cIA.calls, [], 'closeIfAbrupt is not called yet');

	t.equal(SLOT.get(result, '[[GeneratorState]]'), 'SUSPENDED-START', 'generator state starts suspended');
};

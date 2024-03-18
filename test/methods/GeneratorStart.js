'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');
var SLOT = require('internal-slot');

module.exports = function (t, year, GeneratorStart, extras) {
	t.ok(year >= 2025, 'ES2025+');

	var CreateIteratorResultObject = extras.getAO('CreateIteratorResultObject');

	var sentinel = {};
	var generator = {};
	SLOT.set(generator, '[[Sentinel]]', null);
	SLOT.set(generator, '[[CloseIfAbrupt]]', null);
	SLOT.set(generator, '[[GeneratorState]]', null);
	SLOT.set(generator, '[[GeneratorContext]]', null);
	SLOT.set(generator, '[[GeneratorBrand]]', null);

	var retValue;
	var closure = t.captureFn(function () { return retValue(); });
	SLOT.set(closure, '[[Sentinel]]', sentinel);

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { GeneratorStart(primitive, closure); },
			TypeError,
			'generator: ' + debug(primitive) + ' is not an Object'
		);

		SLOT.set(closure, '[[Sentinel]]', primitive);
		t['throws'](
			function () { GeneratorStart(generator, closure); },
			TypeError,
			'closure [[Sentinel]]: ' + debug(primitive) + ' is not an Object'
		);
	});
	SLOT.set(closure, '[[Sentinel]]', sentinel);

	forEach(v.nonFunctions, function (nonFunction) {
		t['throws'](
			function () { GeneratorStart(generator, nonFunction); },
			TypeError,
			'closure: ' + debug(nonFunction) + ' is not a function'
		);
	});

	t.equal(SLOT.get(generator, '[[GeneratorState]]'), null, 'precondition');
	GeneratorStart(generator, closure);
	t.equal(SLOT.get(generator, '[[GeneratorState]]'), 'SUSPENDED-START', 'generator state is started');

	var context = SLOT.get(generator, '[[GeneratorContext]]');
	t.equal(typeof context, 'function', 'generator context is a function');

	t.deepEqual(closure.calls, [], 'closure not called yet');

	retValue = function () { return 42; };
	t.deepEqual(context(), CreateIteratorResultObject(42, false), 'generator context returns expected iterator result');
	t.equal(SLOT.get(generator, '[[GeneratorState]]'), 'SUSPENDED-YIELD', 'generator state is suspended-yield');

	retValue = function () { return sentinel; };
	t.deepEqual(context(), CreateIteratorResultObject(void undefined, true), 'generator context returns done iterator result');
	t.equal(SLOT.get(generator, '[[GeneratorState]]'), 'COMPLETED', 'generator state is completed');
	t.equal(SLOT.get(generator, '[[GeneratorContext]]'), null, 'generator context is now null');

	// wind state back
	SLOT.set(generator, '[[GeneratorState]]', 'SUSPENDED-YIELD');
	SLOT.set(generator, '[[GeneratorContext]]', context);
	retValue = function () { throw new EvalError('42'); };
	t['throws'](
		function () { context(); },
		EvalError,
		'generator context throws'
	);
	t.equal(SLOT.get(generator, '[[GeneratorState]]'), 'COMPLETED', 'generator state is again completed');
	t.equal(SLOT.get(generator, '[[GeneratorContext]]'), null, 'generator context is again null');
};

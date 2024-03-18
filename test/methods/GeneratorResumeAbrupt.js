'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');
var SLOT = require('internal-slot');

module.exports = function (t, year, GeneratorResumeAbrupt, extras) {
	t.ok(year >= 2025, 'ES2025+');

	var NormalCompletion = extras.getAO('NormalCompletion');
	var ReturnCompletion = extras.getAO('ReturnCompletion');
	var ThrowCompletion = extras.getAO('ThrowCompletion');

	var brand = 'brand';
	var completion = ThrowCompletion(42);

	forEach(v.primitives, function (nonObject) {
		t['throws'](
			function () { GeneratorResumeAbrupt(nonObject, completion, brand); },
			TypeError,
			debug(nonObject) + ' is not an object'
		);
	});

	t['throws'](
		function () { GeneratorResumeAbrupt({}, completion, brand); },
		TypeError,
		'object lacking slots, throws'
	);

	var generator = {};
	var state = 'SUSPENDED-YIELD';
	SLOT.set(generator, '[[GeneratorState]]', 'not suspended start/yield or completed');
	SLOT.set(generator, '[[GeneratorBrand]]', brand);
	SLOT.set(generator, '[[GeneratorContext]]', null);

	t['throws'](
		function () { GeneratorResumeAbrupt(generator, completion, brand); },
		TypeError,
		'generator with bad state, throws'
	);
	SLOT.set(generator, '[[GeneratorState]]', state);
	t['throws'](
		function () { GeneratorResumeAbrupt(generator, completion, 'not brand'); },
		TypeError,
		'generator with bad brand, throws'
	);

	t['throws'](
		function () { GeneratorResumeAbrupt(generator, NormalCompletion(), brand); },
		TypeError,
		'generator with bad completion type, throws'
	);

	var context = t.captureFn(function () { return [this, Array.prototype.slice.call(arguments)]; });
	SLOT.set(generator, '[[GeneratorContext]]', context);

	var result = GeneratorResumeAbrupt(generator, completion, brand);
	t.deepEqual(
		result,
		[undefined, [42]],
		'generator context is called with proper arguments, and return value is proxied through'
	);
	t.equal(SLOT.get(generator, '[[GeneratorState]]'), 'EXECUTING', 'state is executing');
	t.deepEqual(
		context.calls,
		[
			{
				args: [42],
				receiver: undefined,
				returned: [undefined, [42]]
			}
		],
		'context is called with proper arguments'
	);
	context.calls.length = 0;

	SLOT.set(generator, '[[GeneratorState]]', 'SUSPENDED-YIELD');
	var sentinel = { sentinel: true };
	var cIA = t.captureFn(function () { return sentinel; });
	SLOT.set(generator, '[[CloseIfAbrupt]]', cIA);
	t.deepEqual(
		GeneratorResumeAbrupt(generator, ReturnCompletion(42), brand),
		{ value: sentinel, done: true },
		'generator with return completion -> done iter result'
	);

	SLOT.set(generator, '[[GeneratorState]]', 'SUSPENDED-START');
	t.deepEqual(
		GeneratorResumeAbrupt(generator, completion, brand),
		{
			value: 42,
			done: true
		},
		'completed state -> done iter result'
	);
	t.equal(SLOT.get(generator, '[[GeneratorState]]'), 'COMPLETED', 'state is completed');
	t.equal(SLOT.get(generator, '[[GeneratorContext]]'), null, 'context is unset');
};

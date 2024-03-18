'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');
var SLOT = require('internal-slot');

module.exports = function (t, year, GeneratorResume) {
	t.ok(year >= 2025, 'ES2025+');

	var brand = 'brand';

	forEach(v.primitives, function (nonObject) {
		t['throws'](
			function () { GeneratorResume(nonObject, null, brand); },
			TypeError,
			debug(nonObject) + ' is not an object'
		);
	});

	t['throws'](
		function () { GeneratorResume({}, null, brand); },
		TypeError,
		'object lacking slots, throws'
	);

	var generator = {};
	var state = 'SUSPENDED-START';
	SLOT.set(generator, '[[GeneratorState]]', 'not suspended start/yield or completed');
	SLOT.set(generator, '[[GeneratorBrand]]', brand);
	SLOT.set(generator, '[[GeneratorContext]]', null);

	t['throws'](
		function () { GeneratorResume(generator, null, brand); },
		TypeError,
		'generator with bad state, throws'
	);
	SLOT.set(generator, '[[GeneratorState]]', state);
	t['throws'](
		function () { GeneratorResume(generator, null, 'not brand'); },
		TypeError,
		'generator with bad brand, throws'
	);

	var sentinel = { sentinel: true };
	var context = function () { return [this, Array.prototype.slice.call(arguments)]; };
	SLOT.set(generator, '[[GeneratorContext]]', context);

	var result = GeneratorResume(generator, sentinel, brand);

	t.deepEqual(
		result,
		[undefined, [sentinel]],
		'generator context is called with proper arguments, and return value is proxied through'
	);
	t.equal(SLOT.get(generator, '[[GeneratorState]]'), 'EXECUTING', 'state is executing');

	SLOT.set(generator, '[[GeneratorState]]', 'COMPLETED');
	t.deepEqual(
		GeneratorResume(generator, 42, brand),
		{
			value: undefined,
			done: true
		},
		'completed state -> done iter result'
	);
};

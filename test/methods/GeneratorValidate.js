'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');
var SLOT = require('internal-slot');

module.exports = function (t, year, GeneratorValidate) {
	t.ok(year >= 2025, 'ES2025+');

	forEach(v.primitives, function (nonObject) {
		t['throws'](
			function () { GeneratorValidate(nonObject, ''); },
			TypeError,
			debug(nonObject) + ' is not an object'
		);
	});

	t['throws'](
		function () { GeneratorValidate({}, ''); },
		TypeError,
		'object lacking slots, throws'
	);

	var generator = {};
	var brand = 'brand';
	var state = 'literally anything but EXECUTING';
	SLOT.set(generator, '[[GeneratorState]]', state);
	SLOT.set(generator, '[[GeneratorBrand]]', brand);
	SLOT.set(generator, '[[GeneratorContext]]', null);

	t['throws'](
		function () { GeneratorValidate(generator, ''); },
		TypeError,
		'generator with bad brand, throws'
	);
	t.equal(GeneratorValidate(generator, brand), state, 'generator with good brand and state, returns state');

	SLOT.set(generator, '[[GeneratorState]]', 'EXECUTING');
	t['throws'](
		function () { GeneratorValidate(generator, brand); },
		TypeError,
		'generator with executing state, throws'
	);
};

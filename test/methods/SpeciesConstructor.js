'use strict';

var v = require('es-value-fixtures');

var hasSpecies = v.hasSymbols && Symbol.species;

/** @type {import('../testHelpers').MethodTest<'SpeciesConstructor'>} */
module.exports = function (t, year, SpeciesConstructor) {
	t.ok(year >= 2015, 'ES2015+');

	// @ts-expect-error
	t['throws'](function () { SpeciesConstructor(null); }, TypeError);
	// @ts-expect-error
	t['throws'](function () { SpeciesConstructor(undefined); }, TypeError);

	var defaultConstructor = function Foo() {};

	t.equal(
		SpeciesConstructor({ constructor: undefined }, defaultConstructor),
		defaultConstructor,
		'undefined constructor returns defaultConstructor'
	);

	t['throws'](
		// @ts-expect-error
		function () { return SpeciesConstructor({ constructor: null }, defaultConstructor); },
		TypeError,
		'non-undefined non-object constructor throws'
	);

	t.test('with Symbol.species', { skip: !hasSpecies }, function (st) {
		/** @constructor */
		function Bar() {}
		Bar[Symbol.species] = null;

		st.equal(
			SpeciesConstructor(new Bar(), defaultConstructor),
			defaultConstructor,
			'undefined/null Symbol.species returns default constructor'
		);

		/** @constructor */
		function Baz() {}
		Baz[Symbol.species] = Bar;
		st.equal(
			SpeciesConstructor(new Baz(), defaultConstructor),
			Bar,
			'returns Symbol.species constructor value'
		);

		Baz[Symbol.species] = {};
		st['throws'](
			function () { SpeciesConstructor(new Baz(), defaultConstructor); },
			TypeError,
			'throws when non-constructor non-null non-undefined species value found'
		);

		st.end();
	});
};

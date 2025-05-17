'use strict';

var v = require('es-value-fixtures');

var hasSpecies = v.hasSymbols && Symbol.species;

module.exports = function (t, year, SpeciesConstructor) {
	t.ok(year >= 2015, 'ES2015+');

	t['throws'](function () { SpeciesConstructor(null); }, TypeError);
	t['throws'](function () { SpeciesConstructor(undefined); }, TypeError);

	var defaultConstructor = function Foo() {};

	t.equal(
		SpeciesConstructor({ constructor: undefined }, defaultConstructor),
		defaultConstructor,
		'undefined constructor returns defaultConstructor'
	);

	t['throws'](
		function () { return SpeciesConstructor({ constructor: null }, defaultConstructor); },
		TypeError,
		'non-undefined non-object constructor throws'
	);

	t.test('with Symbol.species', { skip: !hasSpecies }, function (st) {
		var Bar = function Bar() {};
		Bar[Symbol.species] = null;

		st.equal(
			SpeciesConstructor(new Bar(), defaultConstructor),
			defaultConstructor,
			'undefined/null Symbol.species returns default constructor'
		);

		var Baz = function Baz() {};
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

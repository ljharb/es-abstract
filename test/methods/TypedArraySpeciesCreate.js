'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var typedArrayLength = require('typed-array-length');
var v = require('es-value-fixtures');
var whichTypedArray = require('which-typed-array');

var defineProperty = require('../helpers/defineProperty');
var esV = require('../helpers/v');
var getTypedArrays = require('../helpers/typedArrays');

var hasSpecies = v.hasSymbols && Symbol.species;

module.exports = function (t, year, TypedArraySpeciesCreate) {
	t.ok(year >= 2016, 'ES2016+');

	var availableTypedArrays = getTypedArrays(year);

	t.test('no Typed Array support', { skip: availableTypedArrays.length > 0 }, function (st) {
		forEach(esV.unknowns, function (nonTA) {
			st['throws'](
				function () { TypedArraySpeciesCreate(nonTA, []); },
				SyntaxError,
				'no Typed Array support'
			);
		});

		forEach(v.nonArrays, function (nonArray) {
			st['throws'](
				function () { TypedArraySpeciesCreate(Array, nonArray); },
				SyntaxError,
				'no Typed Array support'
			);
		});
		st.end();
	});

	t.test('Typed Array support', { skip: availableTypedArrays.length === 0 }, function (st) {
		forEach(esV.unknowns, function (nonTA) {
			st['throws'](
				function () { TypedArraySpeciesCreate(nonTA, []); },
				TypeError,
				debug(nonTA) + ' is not a Typed Array'
			);
		});

		var nonArrayTA = new global[availableTypedArrays[0]]();
		forEach([].concat(
			v.primitives,
			v.nonArrays
		), function (nonArray) {
			st['throws'](
				function () { TypedArraySpeciesCreate(nonArrayTA, nonArray); },
				TypeError,
				debug(nonArray) + ' is not an Array'
			);
		});

		forEach(availableTypedArrays, function (TypedArray) {
			var Constructor = global[TypedArray];

			var typedArray = TypedArraySpeciesCreate(new Constructor(), []);
			st.equal(whichTypedArray(typedArray), TypedArray, 'created a ' + TypedArray);
			st.equal(typedArrayLength(typedArray), 0, 'created a ' + TypedArray + ' of length 42');

			var taLength = TypedArraySpeciesCreate(new Constructor(7), [42]);
			st.equal(whichTypedArray(taLength), TypedArray, 'created a ' + TypedArray);
			st.equal(typedArrayLength(taLength), 42, 'created a ' + TypedArray + ' of length 42');
		});

		st.test('with Symbol.species', { skip: !hasSpecies }, function (s2t) {
			forEach(availableTypedArrays, function (TypedArray) {
				var Constructor = global[TypedArray];

				var Bar = function Bar() {};
				Bar[Symbol.species] = null;
				var taBar = new Constructor();
				defineProperty(taBar, 'constructor', { value: Bar });

				s2t.equal(
					whichTypedArray(TypedArraySpeciesCreate(taBar, [])),
					TypedArray,
					TypedArray + ': undefined/null Symbol.species creates with the default constructor'
				);

				var Baz = function Baz() {};
				Baz[Symbol.species] = Bar;
				var taBaz = new Constructor();
				defineProperty(taBaz, 'constructor', { value: Baz });
				s2t['throws'](
					function () { TypedArraySpeciesCreate(taBaz, []); },
					TypeError,
					TypedArray + ': non-TA Symbol.species throws'
				);

				Baz[Symbol.species] = {};
				s2t['throws'](
					function () { TypedArraySpeciesCreate(new Baz(), []); },
					TypeError,
					TypedArray + ': throws when non-constructor non-null non-undefined species value found'
				);
			});

			s2t.end();
		});

		st.end();
	});
};

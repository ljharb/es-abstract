'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

var isArray = require('../../helpers/IsArray');
var defineProperty = require('../helpers/defineProperty');
var esV = require('../helpers/v');
var hasSpecies = v.hasSymbols && Symbol.species;

/** @param {import('../../types').Constructor<unknown, import('../../types').BasicConstructor>} speciesConstructor */
var getArraySubclassWithSpeciesConstructor = function getArraySubclass(speciesConstructor) {
	/** @constructor */
	function Bar() {
		/** @type {unknown[]} */
		var inst = [];
		Object.setPrototypeOf(inst, Bar.prototype);
		defineProperty(inst, 'constructor', { value: Bar });
		return inst;
	}
	Bar.prototype = Object.create(Array.prototype);
	Object.setPrototypeOf(Bar, Array);
	defineProperty(Bar, Symbol.species, { value: speciesConstructor });

	return Bar;
};

/** @type {import('../testHelpers').MethodTest<'ArraySpeciesCreate'>} */
module.exports = function (t, year, ArraySpeciesCreate) {
	t.ok(year >= 2015, 'ES2015+');

	t.test('errors', function (st) {
		forEach(v.nonNumbers, function (nonNumber) {
			st['throws'](
				function () { ArraySpeciesCreate(/** @type {unknown[]} */ ([]), nonNumber); },
				TypeError,
				debug(nonNumber) + ' is not a number'
			);
		});

		st['throws'](
			function () { ArraySpeciesCreate(/** @type {unknown[]} */ ([]), -1); },
			TypeError,
			'-1 is not >= 0'
		);
		st['throws'](
			function () { ArraySpeciesCreate(/** @type {unknown[]} */ ([]), -Infinity); },
			TypeError,
			'-Infinity is not >= 0'
		);

		forEach(v.nonIntegerNumbers, function (nonInteger) {
			st['throws'](
				function () { ArraySpeciesCreate(/** @type {unknown[]} */ ([]), nonInteger); },
				TypeError,
				debug(nonInteger) + ' is not an integer'
			);
		});

		st.end();
	});

	t.test('works with a non-array', function (st) {
		forEach(esV.unknowns, function (nonArray) {
			var arr = ArraySpeciesCreate(nonArray, 0);
			st.ok(isArray(arr), 'is an array');
			st.equal(arr.length, 0, 'length is correct');
			st.equal(arr.constructor, Array, 'constructor is correct');
		});

		st.end();
	});

	t.test('works with a normal array', function (st) {
		var len = 2;
		var orig = [1, 2, 3];
		var arr = ArraySpeciesCreate(orig, len);

		st.ok(isArray(arr), 'is an array');
		st.equal(arr.length, len, 'length is correct');
		st.equal(arr.constructor, orig.constructor, 'constructor is correct');

		st.end();
	});

	t.test('-0 length produces +0 length', function (st) {
		var len = -0;
		st.equal(len, -0, '-0 is negative zero');
		st.notEqual(len, 0, '-0 is not positive zero');

		var orig = [1, 2, 3];
		var arr = ArraySpeciesCreate(orig, len);

		st.equal(isArray(arr), true);
		st.equal(arr.length, 0);
		st.equal(arr.constructor, orig.constructor);

		st.end();
	});

	t.test('works with species construtor', { skip: !hasSpecies }, function (st) {
		var sentinel = {};
		var Foo = function Foo(len) {
			this.length = len;
			this.sentinel = sentinel;
		};
		var Bar = getArraySubclassWithSpeciesConstructor(Foo);
		var bar = new Bar();

		st.equal(isArray(bar), true, 'Bar instance is an array');

		var arr = ArraySpeciesCreate(bar, 3);
		st.equal(arr.constructor, Foo, 'result used species constructor');
		st.equal(arr.length, 3, 'length property is correct');
		st.equal(arr.sentinel, sentinel, 'Foo constructor was exercised');

		st.end();
	});

	t.test('works with null species constructor', { skip: !hasSpecies }, function (st) {
		var Bar = getArraySubclassWithSpeciesConstructor(null);
		var bar = new Bar();

		st.equal(isArray(bar), true, 'Bar instance is an array');

		var arr = ArraySpeciesCreate(bar, 3);
		st.equal(arr.constructor, Array, 'result used default constructor');
		st.equal(arr.length, 3, 'length property is correct');

		st.end();
	});

	t.test('works with undefined species constructor', { skip: !hasSpecies }, function (st) {
		var Bar = getArraySubclassWithSpeciesConstructor();
		var bar = new Bar();

		st.equal(isArray(bar), true, 'Bar instance is an array');

		var arr = ArraySpeciesCreate(bar, 3);
		st.equal(arr.constructor, Array, 'result used default constructor');
		st.equal(arr.length, 3, 'length property is correct');

		st.end();
	});

	t.test('throws with object non-construtor species constructor', { skip: !hasSpecies }, function (st) {
		forEach(v.objects, function (obj) {
			var Bar = getArraySubclassWithSpeciesConstructor(obj);
			var bar = new Bar();

			st.equal(isArray(bar), true, 'Bar instance is an array');

			st['throws'](
				function () { ArraySpeciesCreate(bar, 3); },
				TypeError,
				debug(obj) + ' is not a constructor'
			);
		});

		st.end();
	});
};

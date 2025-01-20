'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var $defineProperty = require('es-define-property');
var keys = require('object-keys');
var hasOwn = require('hasown');

var defineProperty = require('../helpers/defineProperty');
var esV = require('../helpers/v');

module.exports = function (t, year, CopyDataProperties) {
	t.ok(year >= 2018, 'ES2018+');

	t.test('first argument: target', function (st) {
		forEach(v.primitives, function (primitive) {
			st['throws'](
				function () { CopyDataProperties(primitive, {}, []); },
				TypeError,
				debug(primitive) + ' is not an Object'
			);
		});
		st.end();
	});

	t.test('second argument: source', function (st) {
		var frozenTarget = Object.freeze ? Object.freeze({}) : {};
		forEach(v.nullPrimitives, function (nullish) {
			st.equal(
				CopyDataProperties(frozenTarget, nullish, []),
				frozenTarget,
				debug(nullish) + ' "source" yields identical, unmodified target'
			);
		});

		forEach(v.nonNullPrimitives, function (objectCoercible) {
			var target = {};
			var result = CopyDataProperties(target, objectCoercible, []);
			st.equal(result, target, 'result === target');
			st.deepEqual(keys(result), keys(Object(objectCoercible)), 'target ends up with keys of ' + debug(objectCoercible));
		});

		st.test('enumerable accessor property', { skip: !$defineProperty }, function (s2t) {
			var target = {};
			var source = {};
			defineProperty(source, 'a', {
				enumerable: true,
				get: function () { return 42; }
			});
			var result = CopyDataProperties(target, source, []);
			s2t.equal(result, target, 'result === target');
			s2t.deepEqual(result, { a: 42 }, 'target ends up with enumerable accessor of source');
			s2t.end();
		});

		st.end();
	});

	t.test('third argument: excludedItems', function (st) {
		forEach(esV.unknowns, function (nonArray) {
			st['throws'](
				function () { CopyDataProperties({}, {}, nonArray); },
				TypeError,
				debug(nonArray) + ' is not an Array'
			);
		});

		forEach(v.nonPropertyKeys, function (nonPropertyKey) {
			st['throws'](
				function () { CopyDataProperties({}, {}, [nonPropertyKey]); },
				TypeError,
				debug(nonPropertyKey) + ' is not a Property Key'
			);
		});

		var result = CopyDataProperties({}, { a: 1, b: 2, c: 3 }, ['b']);
		st.deepEqual(keys(result).sort(), ['a', 'c'].sort(), 'excluded string keys are excluded');

		st.test('excluding symbols', { skip: !v.hasSymbols }, function (s2t) {
			var source = {};
			forEach(v.symbols, function (symbol) {
				source[symbol] = true;
			});

			var includedSymbols = v.symbols.slice(1);
			var excludedSymbols = v.symbols.slice(0, 1);
			var target = CopyDataProperties({}, source, excludedSymbols);

			forEach(includedSymbols, function (symbol) {
				s2t.equal(hasOwn(target, symbol), true, debug(symbol) + ' is included');
			});

			forEach(excludedSymbols, function (symbol) {
				s2t.equal(hasOwn(target, symbol), false, debug(symbol) + ' is excluded');
			});

			s2t.end();
		});

		st.end();
	});

	// TODO: CopyDataProperties does not throw when copying fails

	// TODO: CopyDataProperties throws when copying fails
};

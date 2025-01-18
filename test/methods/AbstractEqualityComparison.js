'use strict';

var debug = require('object-inspect');
var v = require('es-value-fixtures');
var forEach = require('for-each');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'Abstract Equality Comparison'>} */
module.exports = function (t, year, AbstractEqualityComparison) {
	t.ok(year >= 5, 'ES5+');

	t.test('same types use ===', function (st) {
		forEach(esV.unknowns, function (value) {
			st.equal(AbstractEqualityComparison(value, value), value === value, debug(value) + ' is abstractly equal to itself');
		});
		st.end();
	});

	t.test('different types coerce', function (st) {
		var pairs = [
			[null, undefined],
			[3, '3'],
			[true, '3'],
			[true, 3],
			[false, 0],
			[false, '0'],
			[3, [3]],
			['3', [3]],
			[true, [1]],
			[false, [0]],
			[String(v.coercibleObject), v.coercibleObject],
			[Number(String(v.coercibleObject)), v.coercibleObject],
			[Number(v.coercibleObject), v.coercibleObject],
			[String(Number(v.coercibleObject)), v.coercibleObject],
			[null, {}]
		];
		forEach(pairs, function (pair) {
			var a = pair[0];
			var b = pair[1];
			// eslint-disable-next-line eqeqeq
			st.equal(AbstractEqualityComparison(a, b), a == b, debug(a) + ' == ' + debug(b));
			// eslint-disable-next-line eqeqeq
			st.equal(AbstractEqualityComparison(b, a), b == a, debug(b) + ' == ' + debug(a));
		});
		st.end();
	});

	t.test('Symbols', { skip: !v.hasSymbols || year < 2015 }, function (st) {
		st.equal(
			AbstractEqualityComparison(Symbol(), Symbol()),
			false,
			'Abstract Equality Comparison with two distinct Symbols with no description returns false'
		);

		st.equal(
			AbstractEqualityComparison(Symbol('x'), Symbol('x')),
			false,
			'Abstract Equality Comparison with two distinct Symbols with the same description returns false'
		);

		st.equal(
			AbstractEqualityComparison(Symbol.iterator, Symbol.iterator),
			true,
			'Abstract Equality Comparison with two identical Symbols returns true'
		);

		var x = Symbol('x');
		st.equal(
			AbstractEqualityComparison({ valueOf: function () { return x; } }, x),
			true,
			'Abstract Equality Comparison with an object that coerces to a Symbol, and that Symbol, returns true'
		);
		st.equal(
			AbstractEqualityComparison(x, { valueOf: function () { return x; } }),
			true,
			'Abstract Equality Comparison with a Symbol, and an object that coerces to that Symbol, returns true'
		);

		st.end();
	});

	if (year >= 2020) {
		t.test('BigInts', { skip: !esV.hasBigInts }, function (st) {
			st.equal(
				AbstractEqualityComparison(BigInt(1), 1),
				true,
				debug(BigInt(1)) + ' == ' + debug(1)
			);
			st.equal(
				AbstractEqualityComparison(1, BigInt(1)),
				true,
				debug(1) + ' == ' + debug(BigInt(1))
			);
			st.equal(
				AbstractEqualityComparison(BigInt(1), 1.1),
				false,
				debug(BigInt(1)) + ' != ' + debug(1.1)
			);
			st.equal(
				AbstractEqualityComparison(1.1, BigInt(1)),
				false,
				debug(1.1) + ' != ' + debug(BigInt(1))
			);

			st.equal(
				AbstractEqualityComparison(BigInt(1), '1'),
				true,
				debug(BigInt(1)) + ' == ' + debug('1')
			);
			st.equal(
				AbstractEqualityComparison('1', BigInt(1)),
				true,
				debug(1) + ' == ' + debug(BigInt('1'))
			);
			st.equal(
				AbstractEqualityComparison(BigInt(1), '1.1'),
				false,
				debug(BigInt(1)) + ' != ' + debug('1.1')
			);
			st.equal(
				AbstractEqualityComparison('1.1', BigInt(1)),
				false,
				debug('1.1') + ' != ' + debug(BigInt(1))
			);

			var bigIntObject = {
				valueOf: function () { return BigInt(1); }
			};
			st.equal(
				AbstractEqualityComparison(BigInt(1), bigIntObject),
				true,
				debug(BigInt(1)) + ' == ' + debug(bigIntObject)
			);
			st.equal(
				AbstractEqualityComparison(bigIntObject, BigInt(1)),
				true,
				debug(bigIntObject) + ' == ' + debug(BigInt('1'))
			);
			st.equal(
				AbstractEqualityComparison(BigInt(1), v.coercibleObject),
				false,
				debug(BigInt(1)) + ' != ' + debug(v.coercibleObject)
			);
			st.equal(
				AbstractEqualityComparison(v.coercibleObject, BigInt(1)),
				false,
				debug(bigIntObject) + ' != ' + debug(BigInt(1))
			);

			forEach([NaN, Infinity, -Infinity], function (nonFinite) {
				st.equal(
					AbstractEqualityComparison(BigInt(1), nonFinite),
					false,
					debug(BigInt(1)) + ' != ' + debug(nonFinite)
				);
				st.equal(
					AbstractEqualityComparison(nonFinite, BigInt(1)),
					false,
					debug(nonFinite) + ' != ' + debug(BigInt(1))
				);
			});

			st.end();
		});
	}
};

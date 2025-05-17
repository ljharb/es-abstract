'use strict';

var debug = require('object-inspect');
var v = require('es-value-fixtures');
var forEach = require('for-each');

var esV = require('../helpers/v');

var $BigInt = esV.hasBigInts ? BigInt : null;

module.exports = function (t, year, AbstractRelationalComparison) {
	t.ok(year >= 5, 'ES5+');

	t.test('at least one operand is NaN', function (st) {
		st.equal(AbstractRelationalComparison(NaN, {}, true), undefined, 'LeftFirst: first is NaN, returns undefined');
		st.equal(AbstractRelationalComparison({}, NaN, true), undefined, 'LeftFirst: second is NaN, returns undefined');
		st.equal(AbstractRelationalComparison(NaN, {}, false), undefined, '!LeftFirst: first is NaN, returns undefined');
		st.equal(AbstractRelationalComparison({}, NaN, false), undefined, '!LeftFirst: second is NaN, returns undefined');
		st.end();
	});

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			function () { AbstractRelationalComparison(3, 4, nonBoolean); },
			TypeError,
			debug(nonBoolean) + ' is not a Boolean'
		);
	});

	forEach(v.zeroes, function (zero) {
		t.equal(AbstractRelationalComparison(zero, 1, true), true, 'LeftFirst: ' + debug(zero) + ' is less than 1');
		t.equal(AbstractRelationalComparison(zero, 1, false), true, '!LeftFirst: ' + debug(zero) + ' is less than 1');
		t.equal(AbstractRelationalComparison(1, zero, true), false, 'LeftFirst: 1 is not less than ' + debug(zero));
		t.equal(AbstractRelationalComparison(1, zero, false), false, '!LeftFirst: 1 is not less than ' + debug(zero));

		t.equal(AbstractRelationalComparison(zero, zero, true), false, 'LeftFirst: ' + debug(zero) + ' is not less than ' + debug(zero));
		t.equal(AbstractRelationalComparison(zero, zero, false), false, '!LeftFirst: ' + debug(zero) + ' is not less than ' + debug(zero));
	});

	t.equal(AbstractRelationalComparison(Infinity, -Infinity, true), false, 'LeftFirst: ∞ is not less than -∞');
	t.equal(AbstractRelationalComparison(Infinity, -Infinity, false), false, '!LeftFirst: ∞ is not less than -∞');
	t.equal(AbstractRelationalComparison(-Infinity, Infinity, true), true, 'LeftFirst: -∞ is less than ∞');
	t.equal(AbstractRelationalComparison(-Infinity, Infinity, false), true, '!LeftFirst: -∞ is less than ∞');
	t.equal(AbstractRelationalComparison(-Infinity, 0, true), true, 'LeftFirst: -∞ is less than +0');
	t.equal(AbstractRelationalComparison(-Infinity, 0, false), true, '!LeftFirst: -∞ is less than +0');
	t.equal(AbstractRelationalComparison(0, -Infinity, true), false, 'LeftFirst: +0 is not less than -∞');
	t.equal(AbstractRelationalComparison(0, -Infinity, false), false, '!LeftFirst: +0 is not less than -∞');

	t.equal(AbstractRelationalComparison(3, 4, true), true, 'LeftFirst: 3 is less than 4');
	t.equal(AbstractRelationalComparison(4, 3, true), false, 'LeftFirst: 3 is not less than 4');
	t.equal(AbstractRelationalComparison(3, 4, false), true, '!LeftFirst: 3 is less than 4');
	t.equal(AbstractRelationalComparison(4, 3, false), false, '!LeftFirst: 3 is not less than 4');

	t.equal(AbstractRelationalComparison('3', '4', true), true, 'LeftFirst: "3" is less than "4"');
	t.equal(AbstractRelationalComparison('4', '3', true), false, 'LeftFirst: "3" is not less than "4"');
	t.equal(AbstractRelationalComparison('3', '4', false), true, '!LeftFirst: "3" is less than "4"');
	t.equal(AbstractRelationalComparison('4', '3', false), false, '!LeftFirst: "3" is not less than "4"');

	t.equal(AbstractRelationalComparison('a', 'abc', true), true, 'LeftFirst: "a" is less than "abc"');
	t.equal(AbstractRelationalComparison('abc', 'a', true), false, 'LeftFirst: "abc" is not less than "a"');
	t.equal(AbstractRelationalComparison('a', 'abc', false), true, '!LeftFirst: "a" is less than "abc"');
	t.equal(AbstractRelationalComparison('abc', 'a', false), false, '!LeftFirst: "abc" is not less than "a"');

	t.equal(AbstractRelationalComparison(v.coercibleObject, 42, true), true, 'LeftFirst: coercible object is less than 42');
	t.equal(AbstractRelationalComparison(42, v.coercibleObject, true), false, 'LeftFirst: 42 is not less than coercible object');
	t.equal(AbstractRelationalComparison(v.coercibleObject, 42, false), true, '!LeftFirst: coercible object is less than 42');
	t.equal(AbstractRelationalComparison(42, v.coercibleObject, false), false, '!LeftFirst: 42 is not less than coercible object');

	t.equal(AbstractRelationalComparison(v.coercibleObject, '3', true), false, 'LeftFirst: coercible object is not less than "3"');
	t.equal(AbstractRelationalComparison('3', v.coercibleObject, true), false, 'LeftFirst: "3" is not less than coercible object');
	t.equal(AbstractRelationalComparison(v.coercibleObject, '3', false), false, '!LeftFirst: coercible object is not less than "3"');
	t.equal(AbstractRelationalComparison('3', v.coercibleObject, false), false, '!LeftFirst: "3" is not less than coercible object');

	// TODO: compare LeftFirst true/false for observability

	t.test('bigints', { skip: !esV.hasBigInts || year < 2020 }, function (st) {
		forEach(v.bigints, function (bigint) {
			st.equal(
				AbstractRelationalComparison(bigint, bigint + BigInt(1), false),
				true,
				debug(bigint) + ' is less than the same + 1n'
			);
			st.equal(
				AbstractRelationalComparison(bigint, bigint - BigInt(1), false),
				false,
				debug(bigint) + ' is not less than the same - 1n'
			);

			st.equal(
				AbstractRelationalComparison(bigint, -Infinity, false),
				false,
				debug(bigint) + ' is not less than -∞'
			);
			st.equal(
				AbstractRelationalComparison(-Infinity, bigint, false),
				true,
				'-∞ is less than ' + debug(bigint)
			);
			st.equal(
				AbstractRelationalComparison(bigint, Infinity, false),
				true,
				debug(bigint) + ' is less than ∞'
			);
			st.equal(
				AbstractRelationalComparison(Infinity, bigint, false),
				false,
				'∞ is not less than ' + debug(bigint)
			);
		});

		st.equal(AbstractRelationalComparison($BigInt(0), '1', true), true, 'LeftFirst: 0n is less than "1"');
		st.equal(AbstractRelationalComparison('1', $BigInt(0), true), false, 'LeftFirst: "1" is not less than 0n');
		st.equal(AbstractRelationalComparison($BigInt(0), '1', false), true, '!LeftFirst: 0n is less than "1"');
		st.equal(AbstractRelationalComparison('1', $BigInt(0), false), false, '!LeftFirst: "1" is not less than 0n');

		st.equal(AbstractRelationalComparison($BigInt(0), 1, true), true, 'LeftFirst: 0n is less than 1');
		st.equal(AbstractRelationalComparison(1, $BigInt(0), true), false, 'LeftFirst: 1 is not less than 0n');
		st.equal(AbstractRelationalComparison($BigInt(0), 1, false), true, '!LeftFirst: 0n is less than 1');
		st.equal(AbstractRelationalComparison(1, $BigInt(0), false), false, '!LeftFirst: 1 is not less than 0n');

		st.equal(AbstractRelationalComparison($BigInt(0), $BigInt(1), true), true, 'LeftFirst: 0n is less than 1n');
		st.equal(AbstractRelationalComparison($BigInt(1), $BigInt(0), true), false, 'LeftFirst: 1n is not less than 0n');
		st.equal(AbstractRelationalComparison($BigInt(0), $BigInt(1), false), true, '!LeftFirst: 0n is less than 1n');
		st.equal(AbstractRelationalComparison($BigInt(1), $BigInt(0), false), false, '!LeftFirst: 1n is not less than 0n');

		st.equal(AbstractRelationalComparison($BigInt(0), 'NaN', true), undefined, 'LeftFirst: 0n and "NaN" produce `undefined`');
		st.equal(AbstractRelationalComparison('NaN', $BigInt(0), true), undefined, 'LeftFirst: "NaN" and 0n produce `undefined`');
		st.equal(AbstractRelationalComparison($BigInt(0), 'NaN', false), undefined, '!LeftFirst: 0n and "NaN" produce `undefined`');
		st.equal(AbstractRelationalComparison('NaN', $BigInt(0), false), undefined, '!LeftFirst: "NaN" and 0n produce `undefined`');

		st.equal(AbstractRelationalComparison($BigInt(0), NaN, true), undefined, 'LeftFirst: 0n and NaN produce `undefined`');
		st.equal(AbstractRelationalComparison(NaN, $BigInt(0), true), undefined, 'LeftFirst: NaN and 0n produce `undefined`');
		st.equal(AbstractRelationalComparison($BigInt(0), NaN, false), undefined, '!LeftFirst: 0n and NaN produce `undefined`');
		st.equal(AbstractRelationalComparison(NaN, $BigInt(0), false), undefined, '!LeftFirst: NaN and 0n produce `undefined`');

		st.equal(AbstractRelationalComparison($BigInt(0), Infinity, true), true, 'LeftFirst: 0n is less than Infinity');
		st.equal(AbstractRelationalComparison(Infinity, $BigInt(0), true), false, 'LeftFirst: Infinity is not less than 0n');
		st.equal(AbstractRelationalComparison($BigInt(0), Infinity, false), true, '!LeftFirst: 0n is less than Infinity');
		st.equal(AbstractRelationalComparison(Infinity, $BigInt(0), false), false, '!LeftFirst: Infinity is not less than 0n');

		st.equal(AbstractRelationalComparison($BigInt(0), -Infinity, true), false, 'LeftFirst: 0n is not less than -Infinity');
		st.equal(AbstractRelationalComparison(-Infinity, $BigInt(0), true), true, 'LeftFirst: -Infinity is less than 0n');
		st.equal(AbstractRelationalComparison($BigInt(0), -Infinity, false), false, '!LeftFirst: 0n is not less than -Infinity');
		st.equal(AbstractRelationalComparison(-Infinity, $BigInt(0), false), true, '!LeftFirst: -Infinity is less than 0n');

		st.end();
	});
};

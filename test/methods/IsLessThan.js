'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, IsLessThan) {
	t.ok(year >= 2022, 'ES2022+');

	t.test('at least one operand is NaN', function (st) {
		st.equal(IsLessThan(NaN, {}, true), undefined, 'LeftFirst: first is NaN, returns undefined');
		st.equal(IsLessThan({}, NaN, true), undefined, 'LeftFirst: second is NaN, returns undefined');
		st.equal(IsLessThan(NaN, {}, false), undefined, '!LeftFirst: first is NaN, returns undefined');
		st.equal(IsLessThan({}, NaN, false), undefined, '!LeftFirst: second is NaN, returns undefined');
		st.end();
	});

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			function () { IsLessThan(3, 4, nonBoolean); },
			TypeError,
			debug(nonBoolean) + ' is not a Boolean'
		);
	});

	forEach(v.zeroes, function (zero) {
		t.equal(IsLessThan(zero, 1, true), true, 'LeftFirst: ' + debug(zero) + ' is less than 1');
		t.equal(IsLessThan(zero, 1, false), true, '!LeftFirst: ' + debug(zero) + ' is less than 1');
		t.equal(IsLessThan(1, zero, true), false, 'LeftFirst: 1 is not less than ' + debug(zero));
		t.equal(IsLessThan(1, zero, false), false, '!LeftFirst: 1 is not less than ' + debug(zero));

		t.equal(IsLessThan(zero, zero, true), false, 'LeftFirst: ' + debug(zero) + ' is not less than ' + debug(zero));
		t.equal(IsLessThan(zero, zero, false), false, '!LeftFirst: ' + debug(zero) + ' is not less than ' + debug(zero));
	});

	t.equal(IsLessThan(Infinity, -Infinity, true), false, 'LeftFirst: ∞ is not less than -∞');
	t.equal(IsLessThan(Infinity, -Infinity, false), false, '!LeftFirst: ∞ is not less than -∞');
	t.equal(IsLessThan(-Infinity, Infinity, true), true, 'LeftFirst: -∞ is less than ∞');
	t.equal(IsLessThan(-Infinity, Infinity, false), true, '!LeftFirst: -∞ is less than ∞');
	t.equal(IsLessThan(-Infinity, 0, true), true, 'LeftFirst: -∞ is less than +0');
	t.equal(IsLessThan(-Infinity, 0, false), true, '!LeftFirst: -∞ is less than +0');
	t.equal(IsLessThan(0, -Infinity, true), false, 'LeftFirst: +0 is not less than -∞');
	t.equal(IsLessThan(0, -Infinity, false), false, '!LeftFirst: +0 is not less than -∞');

	t.equal(IsLessThan(3, 4, true), true, 'LeftFirst: 3 is less than 4');
	t.equal(IsLessThan(4, 3, true), false, 'LeftFirst: 3 is not less than 4');
	t.equal(IsLessThan(3, 4, false), true, '!LeftFirst: 3 is less than 4');
	t.equal(IsLessThan(4, 3, false), false, '!LeftFirst: 3 is not less than 4');

	t.equal(IsLessThan('3', '4', true), true, 'LeftFirst: "3" is less than "4"');
	t.equal(IsLessThan('4', '3', true), false, 'LeftFirst: "3" is not less than "4"');
	t.equal(IsLessThan('3', '4', false), true, '!LeftFirst: "3" is less than "4"');
	t.equal(IsLessThan('4', '3', false), false, '!LeftFirst: "3" is not less than "4"');

	t.equal(IsLessThan('a', 'abc', true), true, 'LeftFirst: "a" is less than "abc"');
	t.equal(IsLessThan('abc', 'a', true), false, 'LeftFirst: "abc" is not less than "a"');
	t.equal(IsLessThan('a', 'abc', false), true, '!LeftFirst: "a" is less than "abc"');
	t.equal(IsLessThan('abc', 'a', false), false, '!LeftFirst: "abc" is not less than "a"');

	t.equal(IsLessThan(v.coercibleObject, 42, true), true, 'LeftFirst: coercible object is less than 42');
	t.equal(IsLessThan(42, v.coercibleObject, true), false, 'LeftFirst: 42 is not less than coercible object');
	t.equal(IsLessThan(v.coercibleObject, 42, false), true, '!LeftFirst: coercible object is less than 42');
	t.equal(IsLessThan(42, v.coercibleObject, false), false, '!LeftFirst: 42 is not less than coercible object');

	t.equal(IsLessThan(v.coercibleObject, '3', true), false, 'LeftFirst: coercible object is not less than "3"');
	t.equal(IsLessThan('3', v.coercibleObject, true), false, 'LeftFirst: "3" is not less than coercible object');
	t.equal(IsLessThan(v.coercibleObject, '3', false), false, '!LeftFirst: coercible object is not less than "3"');
	t.equal(IsLessThan('3', v.coercibleObject, false), false, '!LeftFirst: "3" is not less than coercible object');

	t.test('BigInts are supported', { skip: !esV.hasBigInts }, function (st) {
		st.equal(IsLessThan(BigInt(0), '1', true), true, 'LeftFirst: 0n is less than "1"');
		st.equal(IsLessThan('1', BigInt(0), true), false, 'LeftFirst: "1" is not less than 0n');
		st.equal(IsLessThan(BigInt(0), '1', false), true, '!LeftFirst: 0n is less than "1"');
		st.equal(IsLessThan('1', BigInt(0), false), false, '!LeftFirst: "1" is not less than 0n');

		st.equal(IsLessThan(BigInt(0), 1, true), true, 'LeftFirst: 0n is less than 1');
		st.equal(IsLessThan(1, BigInt(0), true), false, 'LeftFirst: 1 is not less than 0n');
		st.equal(IsLessThan(BigInt(0), 1, false), true, '!LeftFirst: 0n is less than 1');
		st.equal(IsLessThan(1, BigInt(0), false), false, '!LeftFirst: 1 is not less than 0n');

		st.equal(IsLessThan(BigInt(0), BigInt(1), true), true, 'LeftFirst: 0n is less than 1n');
		st.equal(IsLessThan(BigInt(1), BigInt(0), true), false, 'LeftFirst: 1n is not less than 0n');
		st.equal(IsLessThan(BigInt(0), BigInt(1), false), true, '!LeftFirst: 0n is less than 1n');
		st.equal(IsLessThan(BigInt(1), BigInt(0), false), false, '!LeftFirst: 1n is not less than 0n');

		st.equal(IsLessThan(BigInt(0), 'NaN', true), undefined, 'LeftFirst: 0n and "NaN" produce `undefined`');
		st.equal(IsLessThan('NaN', BigInt(0), true), undefined, 'LeftFirst: "NaN" and 0n produce `undefined`');
		st.equal(IsLessThan(BigInt(0), 'NaN', false), undefined, '!LeftFirst: 0n and "NaN" produce `undefined`');
		st.equal(IsLessThan('NaN', BigInt(0), false), undefined, '!LeftFirst: "NaN" and 0n produce `undefined`');

		st.equal(IsLessThan(BigInt(0), NaN, true), undefined, 'LeftFirst: 0n and NaN produce `undefined`');
		st.equal(IsLessThan(NaN, BigInt(0), true), undefined, 'LeftFirst: NaN and 0n produce `undefined`');
		st.equal(IsLessThan(BigInt(0), NaN, false), undefined, '!LeftFirst: 0n and NaN produce `undefined`');
		st.equal(IsLessThan(NaN, BigInt(0), false), undefined, '!LeftFirst: NaN and 0n produce `undefined`');

		st.equal(IsLessThan(BigInt(0), Infinity, true), true, 'LeftFirst: 0n is less than Infinity');
		st.equal(IsLessThan(Infinity, BigInt(0), true), false, 'LeftFirst: Infinity is not less than 0n');
		st.equal(IsLessThan(BigInt(0), Infinity, false), true, '!LeftFirst: 0n is less than Infinity');
		st.equal(IsLessThan(Infinity, BigInt(0), false), false, '!LeftFirst: Infinity is not less than 0n');

		st.equal(IsLessThan(BigInt(0), -Infinity, true), false, 'LeftFirst: 0n is not less than -Infinity');
		st.equal(IsLessThan(-Infinity, BigInt(0), true), true, 'LeftFirst: -Infinity is less than 0n');
		st.equal(IsLessThan(BigInt(0), -Infinity, false), false, '!LeftFirst: 0n is not less than -Infinity');
		st.equal(IsLessThan(-Infinity, BigInt(0), false), true, '!LeftFirst: -Infinity is less than 0n');

		st.end();
	});
};

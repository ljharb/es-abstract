'use strict';

var assign = require('object.assign');
var debug = require('object-inspect');
var forEach = require('for-each');
var keys = require('object-keys');
var v = require('es-value-fixtures');
var $defineProperty = require('es-define-property');

var esV = require('../helpers/v');
var kludgeMatch = require('../helpers/kludgeMatch');
var testRESIterator = require('../helpers/testRESIterator');

/** @type {import('../testHelpers').MethodTest<'CreateRegExpStringIterator'>} */
module.exports = function (t, year, CreateRegExpStringIterator) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			// @ts-expect-error
			function () { CreateRegExpStringIterator({}, nonString, false, false); },
			TypeError,
			debug(nonString) + ' is not a String'
		);
	});

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			// @ts-expect-error
			function () { CreateRegExpStringIterator({}, '', nonBoolean, false); },
			TypeError,
			debug(nonBoolean) + ' is not a String (`global`)'
		);

		t['throws'](
			// @ts-expect-error
			function () { CreateRegExpStringIterator({}, '', false, nonBoolean); },
			TypeError,
			debug(nonBoolean) + ' is not a String (`fullUnicode`)'
		);
	});

	var resIterator = CreateRegExpStringIterator(/a/, 'a', false, false);
	forEach(v.primitives, function (nonObject) {
		t['throws'](
			function () { resIterator.next.call(nonObject); },
			TypeError,
			debug(nonObject) + ', receiver of iterator next, is not an Object'
		);
	});
	t['throws'](
		function () { resIterator.next.call({}); },
		TypeError,
		'iterator next receiver is not a RegExp String Iterator'
	);

	t.test('`global` matches `g` flag', function (st) {
		st.test('non-global regex', function (s2t) {
			var regex = /a/;
			var str = 'abcabc';
			var expected = [
				assign(['a'], kludgeMatch(regex, { index: 0, input: str, lastIndex: 1 }))
			];
			testRESIterator(CreateRegExpStringIterator, s2t, regex, str, false, false, expected);
			s2t.end();
		});

		st.test('non-global unicode regex', { skip: !('unicode' in RegExp.prototype) }, function (s2t) {
			var regex = new RegExp(esV.poo.whole, 'u');
			var str = 'a' + esV.poo.whole + 'ca' + esV.poo.whole + 'c';
			var expected = [
				assign([esV.poo.whole], kludgeMatch(regex, { index: 1, input: str, lastIndex: 1 }))
			];
			testRESIterator(CreateRegExpStringIterator, s2t, regex, str, false, true, expected);
			s2t.end();
		});

		st.test('global regex', function (s2t) {
			var regex = /a/g;
			var str = 'abcabc';
			var expected = [
				assign(['a'], kludgeMatch(regex, { index: 0, input: str, lastIndex: 1 })),
				assign(['a'], kludgeMatch(regex, { index: 3, input: str, lastIndex: 4 }))
			];
			testRESIterator(CreateRegExpStringIterator, s2t, regex, str, true, false, expected);

			var emptyRegex = /(?:)/g;
			var abc = 'abc';
			var expected2 = [
				assign([''], kludgeMatch(emptyRegex, { index: 0, input: abc, lastIndex: 1 })),
				assign([''], kludgeMatch(emptyRegex, { index: 1, input: abc, lastIndex: 2 })),
				assign([''], kludgeMatch(emptyRegex, { index: 2, input: abc, lastIndex: 3 })),
				assign([''], kludgeMatch(emptyRegex, { index: 3, input: abc, lastIndex: 4 }))
			];
			testRESIterator(CreateRegExpStringIterator, s2t, emptyRegex, abc, true, false, expected2);

			s2t.end();
		});

		st.test('global unicode regex', { skip: !('unicode' in RegExp.prototype) }, function (s2t) {
			var regex = new RegExp(esV.poo.whole, 'gu');
			var str = 'a' + esV.poo.whole + 'ca' + esV.poo.whole + 'c';
			var expected = [
				assign([esV.poo.whole], kludgeMatch(regex, { index: 1, input: str })),
				assign([esV.poo.whole], kludgeMatch(regex, { index: 5, input: str }))
			];
			testRESIterator(CreateRegExpStringIterator, s2t, regex, str, true, true, expected);
			s2t.end();
		});

		st.end();
	});

	// these tests are technically allowed by the AO, but the spec never causes them to happen
	t.test('`global` does not match `g` flag', { skip: true }, function (st) {
		st.test('non-global regex', function (s2t) {
			var regex = /a/;
			var str = 'abcabc';
			var expected = [
				assign(['a'], kludgeMatch(regex, { index: 0, input: str }))
			];
			testRESIterator(CreateRegExpStringIterator, s2t, regex, str, true, false, expected);
			s2t.end();
		});

		st.test('non-global unicode regex', { skip: !('unicode' in RegExp.prototype) }, function (s2t) {
			var regex = new RegExp(esV.poo.whole, 'u');
			var str = 'a' + esV.poo.whole + 'ca' + esV.poo.whole + 'c';
			var expected = [
				assign([esV.poo.whole], kludgeMatch(regex, { index: 1, input: str }))
			];
			testRESIterator(CreateRegExpStringIterator, s2t, regex, str, true, true, expected);
			s2t.end();
		});

		st.test('global regex', function (s2t) {
			var regex = /a/g;
			var str = 'abcabc';
			var expected = [
				assign(['a'], kludgeMatch(regex, { index: 0, input: str })),
				assign(['a'], kludgeMatch(regex, { index: 3, input: str }))
			];
			testRESIterator(CreateRegExpStringIterator, s2t, regex, str, false, false, expected);
			s2t.end();
		});

		st.test('global unicode regex', { skip: !('unicode' in RegExp.prototype) }, function (s2t) {
			var regex = new RegExp(esV.poo.whole, 'gu');
			var str = 'a' + esV.poo.whole + 'ca' + esV.poo.whole + 'c';
			var expected = [
				assign([esV.poo.whole], kludgeMatch(regex, { index: 1, input: str })),
				assign([esV.poo.whole], kludgeMatch(regex, { index: 5, input: str }))
			];
			testRESIterator(CreateRegExpStringIterator, s2t, regex, str, false, true, expected);
			s2t.end();
		});

		st.end();
	});

	var iterator = CreateRegExpStringIterator(/a/, '', false, false);
	t.deepEqual(keys(iterator), [], 'iterator has no enumerable keys');
	if ($defineProperty) {
		for (var key in iterator) { // eslint-disable-line no-restricted-syntax
			t.fail(debug(key) + ' should not be an enumerable key');
		}
	}
	if (v.hasSymbols) {
		t.equal(iterator[Symbol.iterator](), iterator, 'is iterable for itself');
	}
};

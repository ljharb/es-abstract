'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var assign = require('object.assign');

var defineProperty = require('../helpers/defineProperty');
var kludgeMatch = require('../helpers/kludgeMatch');

/** @type {import('../testHelpers').MethodTest<'RegExpExec'>} */
module.exports = function (t, year, RegExpExec) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			// @ts-expect-error
			function () { RegExpExec(primitive); },
			TypeError,
			'"R" argument must be an object; ' + debug(primitive) + ' is not'
		);
	});

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			// @ts-expect-error
			function () { RegExpExec({}, nonString); },
			TypeError,
			'"S" argument must be a String; ' + debug(nonString) + ' is not'
		);
	});

	t.test('gets and calls a callable "exec"', function (st) {
		var str = '123';
		var o = {
			/** @param {string} S */
			exec: function (S) {
				st.equal(this, o, '"exec" receiver is R');
				st.equal(S, str, '"exec" argument is S');

				return null;
			}
		};
		st.plan(2);
		RegExpExec(o, str);
		st.end();
	});

	t.test('throws if a callable "exec" returns a non-null non-object', function (st) {
		var str = '123';
		st.plan(v.nonNullPrimitives.length);
		forEach(v.nonNullPrimitives, function (nonNullPrimitive) {
			st['throws'](
				// @ts-expect-error
				function () { RegExpExec({ exec: function () { return nonNullPrimitive; } }, str); },
				TypeError,
				'"exec" method must return `null` or an Object; ' + debug(nonNullPrimitive) + ' is not'
			);
		});
		st.end();
	});

	t.test('actual regex that should match against a string', function (st) {
		var S = 'aabc';
		var R = /a/g;
		var match1 = RegExpExec(R, S);
		var expected1 = assign(['a'], kludgeMatch(R, { index: 0, input: S }));
		var match2 = RegExpExec(R, S);
		var expected2 = assign(['a'], kludgeMatch(R, { index: 1, input: S }));
		var match3 = RegExpExec(R, S);
		st.deepEqual(match1, expected1, 'match object 1 is as expected');
		st.deepEqual(match2, expected2, 'match object 2 is as expected');
		st.equal(match3, null, 'match 3 is null as expected');
		st.end();
	});

	t.test('actual regex that should match against a string, with shadowed "exec"', function (st) {
		var S = 'aabc';
		var R = /a/g;
		defineProperty(/** @type {Record<PropertyKey, unknown>} */ (/** @type {unknown} */ (R)), 'exec', { configurable: true, enumerable: true, value: undefined, writable: true });

		var match1 = RegExpExec(R, S);
		var expected1 = assign(['a'], kludgeMatch(R, { index: 0, input: S }));
		var match2 = RegExpExec(R, S);
		var expected2 = assign(['a'], kludgeMatch(R, { index: 1, input: S }));
		var match3 = RegExpExec(R, S);

		st.deepEqual(match1, expected1, 'match object 1 is as expected');
		st.deepEqual(match2, expected2, 'match object 2 is as expected');
		st.equal(match3, null, 'match 3 is null as expected');
		st.end();
	});
};

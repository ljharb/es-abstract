'use strict';

var CharSet = require('../../helpers/CharSet');
var test = require('tape');

test('CharSet', function (t) {
	t.test('constructor', function (st) {
		var testCh = t.captureFn(function (x) { return x.toLowerCase() === x; });
		var yieldCh = t.captureFn(function () {});

		var charSet = new CharSet.CharSet(testCh, yieldCh);
		st.equal(charSet.test, testCh, '`.test` is set');
		st.equal(charSet.yield, yieldCh, '`.yield` is set');
		st.ok(charSet.test('a'));
		st.ok(charSet.test('b'));
		st.notOk(charSet.test('A'));
		st.notOk(charSet.test('B'));

		st.deepEqual(testCh.calls, [
			{ args: ['a'], receiver: charSet, returned: true },
			{ args: ['b'], receiver: charSet, returned: true },
			{ args: ['A'], receiver: charSet, returned: false },
			{ args: ['B'], receiver: charSet, returned: false }
		], 'test calls are as expected');

		st.end();
	});

	t.test('getCodeUnits', function (st) {
		var cs = CharSet.getCodeUnits();

		st.notEqual(cs, CharSet.getCodeUnits(), 'returns a new object each time');

		var count = 0;
		cs.yield(function () { count += 1; });

		st.equal(count, 57344, 'yields the right number code units');

		st.equal(cs.count(), count, '.count() is the same as yield()');

		st.end();
	});

	t.test('getCodePoints', function (st) {
		var cs = CharSet.getCodePoints();

		st.notEqual(cs, CharSet.getCodePoints(), 'returns a new object each time');

		var count = 0;
		cs.yield(function () { count += 1; });

		st.equal(count, 1105920, 'yields the right number of code points');

		st.equal(cs.count(), count, '.count() is the same as yield()');

		st.end();
	});

	t.test('getNonSimpleCaseFoldingCodePoints', function (st) {
		var cs = CharSet.getNonSimpleCaseFoldingCodePoints();

		st.notEqual(cs, CharSet.getNonSimpleCaseFoldingCodePoints(), 'returns a new object each time');

		var count = 0;
		cs.yield(function () { count += 1; });

		st.equal(count, 1105892, 'yields the right number of non-simple-case-folding code points');

		st.equal(cs.count(), count, '.count() is the same as yield()');

		st.end();
	});
});

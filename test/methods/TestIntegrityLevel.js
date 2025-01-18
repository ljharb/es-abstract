'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'TestIntegrityLevel'>} */
module.exports = function (t, year, TestIntegrityLevel) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			// @ts-expect-error
			function () { TestIntegrityLevel(primitive); },
			TypeError,
			debug(primitive) + ' is not an Object'
		);
	});

	t['throws'](
		// @ts-expect-error
		function () { TestIntegrityLevel({ a: 1 }); },
		/^TypeError: Assertion failed: `level` must be `"sealed"` or `"frozen"`$/,
		'`level` must be `"sealed"` or `"frozen"`'
	);

	t.equal(TestIntegrityLevel({ a: 1 }, 'sealed'), false, 'basic object is not sealed');
	t.equal(TestIntegrityLevel({ a: 1 }, 'frozen'), false, 'basic object is not frozen');

	t.test('preventExtensions', { skip: !Object.preventExtensions }, function (st) {
		var o = Object.preventExtensions({ a: 1 });
		st.equal(TestIntegrityLevel(o, 'sealed'), false, 'nonextensible object is not sealed');
		st.equal(TestIntegrityLevel(o, 'frozen'), false, 'nonextensible object is not frozen');

		var empty = Object.preventExtensions({});
		st.equal(TestIntegrityLevel(empty, 'sealed'), true, 'empty nonextensible object is sealed');
		st.equal(TestIntegrityLevel(empty, 'frozen'), true, 'empty nonextensible object is frozen');
		st.end();
	});

	t.test('seal', { skip: !Object.seal }, function (st) {
		var o = Object.seal({ a: 1 });
		st.equal(TestIntegrityLevel(o, 'sealed'), true, 'sealed object is sealed');
		st.equal(TestIntegrityLevel(o, 'frozen'), false, 'sealed object is not frozen');

		var empty = Object.seal({});
		st.equal(TestIntegrityLevel(empty, 'sealed'), true, 'empty sealed object is sealed');
		st.equal(TestIntegrityLevel(empty, 'frozen'), true, 'empty sealed object is frozen');

		st.end();
	});

	t.test('freeze', { skip: !Object.freeze }, function (st) {
		var o = Object.freeze({ a: 1 });
		st.equal(TestIntegrityLevel(o, 'sealed'), true, 'frozen object is sealed');
		st.equal(TestIntegrityLevel(o, 'frozen'), true, 'frozen object is frozen');

		var empty = Object.freeze({});
		st.equal(TestIntegrityLevel(empty, 'sealed'), true, 'empty frozen object is sealed');
		st.equal(TestIntegrityLevel(empty, 'frozen'), true, 'empty frozen object is frozen');

		st.end();
	});
};

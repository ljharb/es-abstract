'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var specEnum = require('../../helpers/specEnum');

module.exports = function (t, year, TestIntegrityLevel) {
	t.ok(year >= 2015, 'ES2015+');

	var SEALED = specEnum(year, 'sealed');
	var FROZEN = specEnum(year, 'frozen');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { TestIntegrityLevel(primitive); },
			TypeError,
			debug(primitive) + ' is not an Object'
		);
	});

	t['throws'](
		function () { TestIntegrityLevel({ a: 1 }); },
		/^TypeError: Assertion failed: `level` must be `"sealed"` or `"frozen"`$/,
		'`level` must be `"sealed"` or `"frozen"`'
	);

	t.equal(TestIntegrityLevel({ a: 1 }, SEALED), false, 'basic object is not sealed');
	t.equal(TestIntegrityLevel({ a: 1 }, FROZEN), false, 'basic object is not frozen');

	t.test('preventExtensions', { skip: !Object.preventExtensions }, function (st) {
		var o = Object.preventExtensions({ a: 1 });
		st.equal(TestIntegrityLevel(o, SEALED), false, 'nonextensible object is not sealed');
		st.equal(TestIntegrityLevel(o, FROZEN), false, 'nonextensible object is not frozen');

		var empty = Object.preventExtensions({});
		st.equal(TestIntegrityLevel(empty, SEALED), true, 'empty nonextensible object is sealed');
		st.equal(TestIntegrityLevel(empty, FROZEN), true, 'empty nonextensible object is frozen');
		st.end();
	});

	t.test('seal', { skip: !Object.seal }, function (st) {
		var o = Object.seal({ a: 1 });
		st.equal(TestIntegrityLevel(o, SEALED), true, 'sealed object is sealed');
		st.equal(TestIntegrityLevel(o, FROZEN), false, 'sealed object is not frozen');

		var empty = Object.seal({});
		st.equal(TestIntegrityLevel(empty, SEALED), true, 'empty sealed object is sealed');
		st.equal(TestIntegrityLevel(empty, FROZEN), true, 'empty sealed object is frozen');

		st.end();
	});

	t.test('freeze', { skip: !Object.freeze }, function (st) {
		var o = Object.freeze({ a: 1 });
		st.equal(TestIntegrityLevel(o, SEALED), true, 'frozen object is sealed');
		st.equal(TestIntegrityLevel(o, FROZEN), true, 'frozen object is frozen');

		var empty = Object.freeze({});
		st.equal(TestIntegrityLevel(empty, SEALED), true, 'empty frozen object is sealed');
		st.equal(TestIntegrityLevel(empty, FROZEN), true, 'empty frozen object is frozen');

		st.end();
	});
};

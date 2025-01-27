'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var Enum = require('../../helpers/enum');

module.exports = function (t, year, TestIntegrityLevel) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { TestIntegrityLevel(primitive); },
			TypeError,
			debug(primitive) + ' is not an Object'
		);
	});

	t['throws'](
		function () { TestIntegrityLevel({ a: 1 }); },
		/^TypeError: Assertion failed: `level` must be one of ~sealed~, ~frozen~./,
		'`level` must be one of ~sealed~, ~frozen~'
	);

	var sealeds = ['sealed', Enum('sealed')];
	var frozens = ['frozen', Enum('frozen')];

	forEach(sealeds, function (sealed) {
		t.equal(TestIntegrityLevel({ a: 1 }, sealed), false, 'basic object is not sealed');
	});
	forEach(frozens, function (frozen) {
		t.equal(TestIntegrityLevel({ a: 1 }, frozen), false, 'basic object is not frozen');
	});

	t.test('preventExtensions', { skip: !Object.preventExtensions }, function (st) {
		var o = Object.preventExtensions({ a: 1 });
		forEach(sealeds, function (sealed) {
			st.equal(TestIntegrityLevel(o, sealed), false, 'nonextensible object is not sealed');
		});
		forEach(frozens, function (frozen) {
			st.equal(TestIntegrityLevel(o, frozen), false, 'nonextensible object is not frozen');
		});

		var empty = Object.preventExtensions({});
		forEach(sealeds, function (sealed) {
			st.equal(TestIntegrityLevel(empty, sealed), true, 'empty nonextensible object is sealed');
		});
		forEach(frozens, function (frozen) {
			st.equal(TestIntegrityLevel(empty, frozen), true, 'empty nonextensible object is frozen');
		});
		st.end();
	});

	t.test('seal', { skip: !Object.seal }, function (st) {
		var o = Object.seal({ a: 1 });
		forEach(sealeds, function (sealed) {
			st.equal(TestIntegrityLevel(o, sealed), true, 'sealed object is sealed');
		});
		forEach(frozens, function (frozen) {
			st.equal(TestIntegrityLevel(o, frozen), false, 'sealed object is not frozen');
		});

		var empty = Object.seal({});
		forEach(sealeds, function (sealed) {
			st.equal(TestIntegrityLevel(empty, sealed), true, 'empty sealed object is sealed');
		});
		forEach(frozens, function (frozen) {
			st.equal(TestIntegrityLevel(empty, frozen), true, 'empty sealed object is frozen');
		});

		st.end();
	});

	t.test('freeze', { skip: !Object.freeze }, function (st) {
		var o = Object.freeze({ a: 1 });
		forEach(sealeds, function (sealed) {
			st.equal(TestIntegrityLevel(o, sealed), true, 'frozen object is sealed');
		});
		forEach(frozens, function (frozen) {
			st.equal(TestIntegrityLevel(o, frozen), true, 'frozen object is frozen');
		});

		var empty = Object.freeze({});
		forEach(sealeds, function (sealed) {
			st.equal(TestIntegrityLevel(empty, sealed), true, 'empty frozen object is sealed');
		});
		forEach(frozens, function (frozen) {
			st.equal(TestIntegrityLevel(empty, frozen), true, 'empty frozen object is frozen');
		});

		st.end();
	});
};

'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var $setProto = require('set-proto');
var $getProto = require('get-proto');

module.exports = function (t, year, StringCreate) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			function () { StringCreate(nonString, String.prototype); },
			TypeError,
			debug(nonString) + ' is not a String'
		);
	});

	t.deepEqual(StringCreate('foo', String.prototype), Object('foo'), '"foo" with `String.prototype` makes `Object("foo")');

	var proto = {};
	if ($setProto) {
		t.equal($getProto(StringCreate('', proto)), proto, '[[Prototype]] is set as expected');
	} else {
		t['throws'](
			function () { StringCreate('', proto); },
			SyntaxError,
			'setting [[Prototype]] is not supported in this env'
		);
	}

	t.equal(StringCreate('a', String.prototype).length, 'a'.length, 'length is preserved');
};

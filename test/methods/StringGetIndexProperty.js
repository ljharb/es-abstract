'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, StringGetIndexProperty) {
	t.ok(year >= 2015, 'ES2015+');

	forEach([].concat(
		v.nonStrings,
		v.strings
	), function (nonStringObjects) {
		t['throws'](
			function () { StringGetIndexProperty(nonStringObjects); },
			TypeError,
			debug(nonStringObjects) + ' is not a boxed String Object'
		);
	});

	forEach(v.nonPropertyKeys, function (nonPropertyKey) {
		t['throws'](
			function () { StringGetIndexProperty('', nonPropertyKey); },
			TypeError,
			debug(nonPropertyKey) + ' is not a Property Key'
		);
	});

	forEach(v.symbols, function (symbol) {
		t.equal(
			StringGetIndexProperty(Object('a'), symbol),
			undefined,
			debug(symbol) + ' is a Property Key, but not a String'
		);
	});

	// a string where CanonicalNumericIndexString returns undefined, a non-integer, or -0
	forEach([].concat(
		'-1',
		'-0',
		'undefined',
		v.nonIntegerNumbers
	), function (nonIndex) {
		var S = Object('abc');
		t.equal(
			StringGetIndexProperty(S, String(nonIndex)),
			undefined,
			debug(nonIndex) + ' is not an index inside ' + debug(S)
		);
	});

	forEach(v.strings, function (str) {
		var S = Object(str);
		for (var i = 0; i < str.length; i += 1) {
			var desc = {
				'[[Configurable]]': false,
				'[[Enumerable]]': true,
				'[[Value]]': str.charAt(i),
				'[[Writable]]': false
			};
			t.deepEqual(
				StringGetIndexProperty(S, String(i)),
				desc,
				'boxed String ' + debug(S) + ' at index ' + debug(i) + ' is ' + debug(desc)
			);
		}
		t.equal(
			StringGetIndexProperty(S, String(str.length)),
			undefined,
			'boxed String ' + debug(S) + ' at OOB index ' + debug(str.length) + ' is `undefined'
		);
	});
};

'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var CharSet = require('../../helpers/CharSet');

module.exports = function (t, year, CharacterRange) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(['', 'abc', [], ['a', 'b', 'c']], function (notOne) {
		t['throws'](
			function () { CharacterRange(CharSet.from([notOne]), CharSet.from(['a'])); },
			TypeError,
			debug(notOne) + ' as first arg does not have 1 item'
		);
		t['throws'](
			function () { CharacterRange(CharSet.from(['a']), CharSet.from([notOne])); },
			TypeError,
			debug(notOne) + ' as second arg does not have 1 item'
		);
		t['throws'](
			function () { CharacterRange(CharSet.from([notOne]), CharSet.from([notOne])); },
			TypeError,
			debug(notOne) + ' as both args do not have 1 item'
		);

		t['throws'](
			function () { CharacterRange(notOne, 'a'); },
			TypeError,
			debug(notOne) + ' as first arg does not have 1 item'
		);
		t['throws'](
			function () { CharacterRange('a', notOne); },
			TypeError,
			debug(notOne) + ' as second arg does not have 1 item'
		);
		t['throws'](
			function () { CharacterRange(notOne, notOne); },
			TypeError,
			debug(notOne) + ' as both args do not have 1 item'
		);
	});

	t['throws'](
		function () { CharacterRange(CharSet.from(['b']), CharSet.from(['a'])); },
		TypeError,
		'a backwards range throws'
	);
	t.deepEqual(
		CharacterRange(CharSet.from(['a']), CharSet.from(['b'])),
		['a', 'b']
	);
	t.deepEqual(
		CharacterRange(CharSet.from(['Z']), CharSet.from(['a'])),
		['Z', '[', '\\', ']', '^', '_', '`', 'a']
	);

	t['throws'](
		function () { CharacterRange('b', 'a'); },
		TypeError,
		'a backwards range throws'
	);
	t.deepEqual(
		CharacterRange('a', 'b'),
		['a', 'b']
	);
	t.deepEqual(
		CharacterRange('Z', 'a'),
		['Z', '[', '\\', ']', '^', '_', '`', 'a']
	);
};

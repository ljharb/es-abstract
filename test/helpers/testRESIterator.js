'use strict';

var v = require('es-value-fixtures');

var testIterator = require('./testIterator');

/** @type {(CreateRegExpStringIterator: (regex: RegExp, str: string, global: boolean, unicode: boolean) => Iterator<RegExpMatchArray>, t: import('tape').Test, regex: RegExp, str: string, global: boolean, unicode: boolean, expected: RegExpMatchArray[]) => void} */
module.exports = function testRegExpStringIterator(CreateRegExpStringIterator, t, regex, str, global, unicode, expected) {
	var iterator = CreateRegExpStringIterator(regex, str, global, unicode);
	t.equal(typeof iterator, 'object', 'iterator is an object');
	t.equal(typeof iterator.next, 'function', '`.next` is a function');

	t.test('has symbols', { skip: !v.hasSymbols }, function (st) {
		st.equal(typeof iterator[Symbol.iterator], 'function', '[`Symbol.iterator`] is a function');
		st.end();
	});

	testIterator(t, iterator, expected);
};

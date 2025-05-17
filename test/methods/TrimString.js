'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, TrimString) {
	t.ok(year >= 2019, 'ES2019+');

	t.test('non-object string', function (st) {
		forEach(v.nullPrimitives, function (nullish) {
			st['throws'](
				function () { TrimString(nullish); },
				debug(nullish) + ' is not an Object'
			);
		});
		st.end();
	});

	t['throws'](
		function () { TrimString('abc', 'not start, end, or start+end'); },
		TypeError,
		'invalid `where` value'
	);

	var string = ' \n abc  \n ';
	t.equal(TrimString(string, 'start'), string.slice(string.indexOf('a')));
	t.equal(TrimString(string, 'end'), string.slice(0, string.lastIndexOf('c') + 1));
	t.equal(TrimString(string, 'start+end'), string.slice(string.indexOf('a'), string.lastIndexOf('c') + 1));
};

'use strict';

var forEach = require('for-each');

var Enum = require('../../helpers/enum');

module.exports = function (t, year, StringPaddingBuiltinsImpl) {
	t.ok(year >= 2024, 'ES2024+');

	t['throws'](
		function () { StringPaddingBuiltinsImpl('', 0, '', 'not start or end'); },
		TypeError,
		'`placement` must be ~START~ or ~END~'
	);

	forEach([].concat(
		year <= 2024 ? ['start', Enum('start')] : [],
		year === 2024 ? 'START' : [],
		year >= 2024 ? Enum('START') : []
	), function (start) {
		t.equal(StringPaddingBuiltinsImpl('abc', 1, undefined, start), 'abc');
		t.equal(StringPaddingBuiltinsImpl('a', 3, '', start), 'a');
		t.equal(StringPaddingBuiltinsImpl('a', 3, undefined, start), '  a');
		t.equal(StringPaddingBuiltinsImpl('a', 3, '0', start), '00a');
		t.equal(StringPaddingBuiltinsImpl('a', 3, '012', start), '01a');
		t.equal(StringPaddingBuiltinsImpl('a', 7, '012', start), '012012a');
	});

	forEach([].concat(
		year <= 2024 ? ['end', Enum('end')] : [],
		year === 2024 ? 'END' : [],
		year >= 2024 ? Enum('END') : []
	), function (end) {
		t.equal(StringPaddingBuiltinsImpl('a', 3, '', end), 'a');
		t.equal(StringPaddingBuiltinsImpl('a', 3, undefined, end), 'a  ');
		t.equal(StringPaddingBuiltinsImpl('a', 3, '0', end), 'a00');
		t.equal(StringPaddingBuiltinsImpl('a', 3, '012', end), 'a01');
		t.equal(StringPaddingBuiltinsImpl('a', 7, '012', end), 'a012012');
	});
};

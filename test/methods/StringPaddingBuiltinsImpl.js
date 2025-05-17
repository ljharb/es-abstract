'use strict';

module.exports = function (t, year, StringPaddingBuiltinsImpl) {
	t.ok(year >= 2024, 'ES2024+');

	t['throws'](
		function () { StringPaddingBuiltinsImpl('', 0, '', 'not start or end'); },
		TypeError,
		'`placement` must be ~START~ or ~END~'
	);

	t.equal(StringPaddingBuiltinsImpl('a', 3, '', 'start'), 'a');
	t.equal(StringPaddingBuiltinsImpl('a', 3, '', 'end'), 'a');
	t.equal(StringPaddingBuiltinsImpl('a', 3, '0', 'start'), '00a');
	t.equal(StringPaddingBuiltinsImpl('a', 3, '0', 'end'), 'a00');
	t.equal(StringPaddingBuiltinsImpl('a', 3, '012', 'start'), '01a');
	t.equal(StringPaddingBuiltinsImpl('a', 3, '012', 'end'), 'a01');
	t.equal(StringPaddingBuiltinsImpl('a', 7, '012', 'start'), '012012a');
	t.equal(StringPaddingBuiltinsImpl('a', 7, '012', 'end'), 'a012012');
	t.equal(StringPaddingBuiltinsImpl('a', 3, undefined, 'start'), '  a');
	t.equal(StringPaddingBuiltinsImpl('abc', 1, undefined, 'start'), 'abc');

	t.equal(StringPaddingBuiltinsImpl('a', 3, '', 'START'), 'a');
	t.equal(StringPaddingBuiltinsImpl('a', 3, '', 'END'), 'a');
	t.equal(StringPaddingBuiltinsImpl('a', 3, '0', 'START'), '00a');
	t.equal(StringPaddingBuiltinsImpl('a', 3, '0', 'END'), 'a00');
	t.equal(StringPaddingBuiltinsImpl('a', 3, '012', 'START'), '01a');
	t.equal(StringPaddingBuiltinsImpl('a', 3, '012', 'END'), 'a01');
	t.equal(StringPaddingBuiltinsImpl('a', 7, '012', 'START'), '012012a');
	t.equal(StringPaddingBuiltinsImpl('a', 7, '012', 'END'), 'a012012');
	t.equal(StringPaddingBuiltinsImpl('a', 3, undefined, 'START'), '  a');
	t.equal(StringPaddingBuiltinsImpl('abc', 1, undefined, 'START'), 'abc');
};

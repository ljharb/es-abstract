'use strict';

/** @type {import('../testHelpers').MethodTest<'StringPad'>} */
module.exports = function (t, year, StringPad) {
	t.ok(year >= 2020, 'ES2020+');

	t['throws'](
		// @ts-expect-error
		function () { StringPad('', 0, '', 'not start or end'); },
		TypeError,
		'`placement` must be "start" or "end"'
	);

	if (year < 2025) {
		t.equal(StringPad('a', 3, '', 'start'), 'a');
		t.equal(StringPad('a', 3, '', 'end'), 'a');
		t.equal(StringPad('a', 3, year >= 2024 ? ' ' : undefined, 'start'), '  a');
		t.equal(StringPad('a', 3, year >= 2024 ? ' ' : undefined, 'end'), 'a  ');
		t.equal(StringPad('a', 3, '0', 'start'), '00a');
		t.equal(StringPad('a', 3, '0', 'end'), 'a00');
		t.equal(StringPad('a', 3, '012', 'start'), '01a');
		t.equal(StringPad('a', 3, '012', 'end'), 'a01');
		t.equal(StringPad('a', 7, '012', 'start'), '012012a');
		t.equal(StringPad('a', 7, '012', 'end'), 'a012012');
	}

	if (year >= 2024) {
		var StringPad2024 = /** @type {import('../testHelpers').AOOnlyYears<'StringPad', 2024>} */ (StringPad);
		t.equal(StringPad2024('a', 3, '', 'START'), 'a');
		t.equal(StringPad2024('a', 3, '', 'END'), 'a');
		t.equal(StringPad2024('a', 3, ' ', 'START'), '  a');
		t.equal(StringPad2024('a', 3, ' ', 'END'), 'a  ');
		t.equal(StringPad2024('a', 3, '0', 'START'), '00a');
		t.equal(StringPad2024('a', 3, '0', 'END'), 'a00');
		t.equal(StringPad2024('a', 3, '012', 'START'), '01a');
		t.equal(StringPad2024('a', 3, '012', 'END'), 'a01');
		t.equal(StringPad2024('a', 7, '012', 'START'), '012012a');
		t.equal(StringPad2024('a', 7, '012', 'END'), 'a012012');
	}
};

'use strict';

var specEnum = require('../../helpers/specEnum');

module.exports = function (t, year, StringPad) {
	t.ok(year >= 2020, 'ES2020+');

	t['throws'](
		function () { StringPad('', 0, '', 'not start or end'); },
		TypeError,
		'`placement` must be "start" or "end"'
	);

	// the canonical placement spelling for every year
	var START = specEnum(year, 'start');
	var END = specEnum(year, 'end');

	t.equal(StringPad('a', 3, '', START), 'a');
	t.equal(StringPad('a', 3, '', END), 'a');
	t.equal(StringPad('a', 3, year >= 2024 ? ' ' : undefined, START), '  a');
	t.equal(StringPad('a', 3, year >= 2024 ? ' ' : undefined, END), 'a  ');
	t.equal(StringPad('a', 3, '0', START), '00a');
	t.equal(StringPad('a', 3, '0', END), 'a00');
	t.equal(StringPad('a', 3, '012', START), '01a');
	t.equal(StringPad('a', 3, '012', END), 'a01');
	t.equal(StringPad('a', 7, '012', START), '012012a');
	t.equal(StringPad('a', 7, '012', END), 'a012012');

	if (year >= 2024 && year < 2026) {
		// ES2024-ES2025 also accept the uppercase alias spellings
		t.equal(StringPad('a', 3, '', 'START'), 'a');
		t.equal(StringPad('a', 3, '', 'END'), 'a');
		t.equal(StringPad('a', 3, ' ', 'START'), '  a');
		t.equal(StringPad('a', 3, ' ', 'END'), 'a  ');
		t.equal(StringPad('a', 3, '0', 'START'), '00a');
		t.equal(StringPad('a', 3, '0', 'END'), 'a00');
		t.equal(StringPad('a', 3, '012', 'START'), '01a');
		t.equal(StringPad('a', 3, '012', 'END'), 'a01');
		t.equal(StringPad('a', 7, '012', 'START'), '012012a');
		t.equal(StringPad('a', 7, '012', 'END'), 'a012012');
	}
};

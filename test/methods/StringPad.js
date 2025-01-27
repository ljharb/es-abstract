'use strict';

var forEach = require('for-each');

var Enum = require('../../helpers/enum');

module.exports = function (t, year, StringPad) {
	t.ok(year >= 2020, 'ES2020+');

	t['throws'](
		function () { StringPad('', 0, '', 'not start or end'); },
		TypeError,
		'`placement` must be ~start~ or ~end~'
	);

	forEach([].concat(
		year <= 2024 ? ['start', Enum('start')] : [],
		year === 2024 ? 'START' : [],
		year >= 2024 ? Enum('START') : []
	), function (start) {
		t.equal(StringPad('a', 3, '', start), 'a');
		t.equal(StringPad('a', 3, year >= 2024 ? ' ' : undefined, start), '  a');
		t.equal(StringPad('a', 3, '0', start), '00a');
		t.equal(StringPad('a', 3, '012', start), '01a');
		t.equal(StringPad('a', 7, '012', start), '012012a');
	});

	forEach([].concat(
		year <= 2024 ? ['end', Enum('end')] : [],
		year === 2024 ? 'END' : [],
		year >= 2024 ? Enum('END') : []
	), function (end) {
		t.equal(StringPad('a', 3, '', end), 'a');
		t.equal(StringPad('a', 3, year >= 2024 ? ' ' : undefined, end), 'a  ');
		t.equal(StringPad('a', 3, '0', end), 'a00');
		t.equal(StringPad('a', 3, '012', end), 'a01');
		t.equal(StringPad('a', 7, '012', end), 'a012012');
	});
};

'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, GetMatchString) {
	t.ok(year >= 2022, 'ES2022+');

	forEach(v.nonStrings, function (notString) {
		t['throws'](
			function () { return GetMatchString(notString); },
			TypeError,
			debug(notString) + ' is not a string'
		);
	});

	forEach([].concat(
		esV.unknowns,
		{ '[[StartIndex]]': -1 },
		{ '[[StartIndex]]': 1.2, '[[EndIndex]]': 0 },
		{ '[[StartIndex]]': 1, '[[EndIndex]]': 0 }
	), function (notMatchRecord) {
		t['throws'](
			function () { return GetMatchString('', notMatchRecord); },
			TypeError,
			debug(notMatchRecord) + ' is not a Match Record'
		);
	});

	var invalidStart = { '[[StartIndex]]': 1, '[[EndIndex]]': 2 };
	t['throws'](
		function () { return GetMatchString('', invalidStart); },
		TypeError,
		debug(invalidStart) + ' has a [[StartIndex]] that is > the length of the string'
	);

	var invalidEnd = { '[[StartIndex]]': 0, '[[EndIndex]]': 1 };
	t['throws'](
		function () { return GetMatchString('', invalidEnd); },
		TypeError,
		debug(invalidEnd) + ' has an [[EndIndex]] that is > the length of the string'
	);

	t.equal(
		GetMatchString('', { '[[StartIndex]]': 0, '[[EndIndex]]': 0 }),
		''
	);
	t.equal(
		GetMatchString('abc', { '[[StartIndex]]': 1, '[[EndIndex]]': 2 }),
		'b'
	);
};

'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, truncate) {
	t.ok(year >= 2023, 'ES2023+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			function () { truncate(nonNumber); },
			TypeError,
			debug(nonNumber) + ' is not a number'
		);
	});

	t.equal(truncate(-1.1), -1, '-1.1 truncates to -1');
	t.equal(truncate(1.1), 1, '1.1 truncates to 1');
	t.equal(truncate(0), 0, '+0 truncates to +0');
	t.equal(truncate(-0), 0, '-0 truncates to +0');
};

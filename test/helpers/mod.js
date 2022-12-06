'use strict';

var test = require('tape');
var forEach = require('for-each');
var debug = require('object-inspect');

var mod = require('../../helpers/mod');

test('mod', function (t) {
	forEach([-3, -0, 0, 3], function (n) {
		var expected = n < 0 || (1 / n === -Infinity) ? -0 : 0;
		t.equal(mod(n, 3), expected, 'mod(' + debug(n) + ', 3) === ' + debug(expected));
	});

	t.end();
});

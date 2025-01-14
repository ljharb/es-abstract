'use strict';

var test = require('tape');
var forEach = require('for-each');
var inspect = require('object-inspect');

var isSameType = require('../../helpers/isSameType');

test('isSameType', function (t) {
	forEach([
		undefined,
		null,
		false,
		true,
		42,
		NaN,
		0,
		-1,
		Infinity,
		-Infinity,
		'',
		'abc'
	], function (v) {
		t.ok(isSameType(v, v), inspect(v) + ' is the same type as itself');
	});

	forEach([
		[42, NaN],
		['', 'abc']
	], function (pair) {
		t.ok(isSameType(pair[0], pair[1]), inspect(pair[0]) + ' is the same type as ' + inspect(pair[1]));
		t.ok(isSameType(pair[1], pair[0]), inspect(pair[1]) + ' is the same type as ' + inspect(pair[0]));
	});

	forEach([
		[null, undefined],
		[1, '1'],
		[1, Object(1)],
		[null, {}]
	], function (pair) {
		t.notOk(isSameType(pair[0], pair[1]), inspect(pair[0]) + ' is not the same type as ' + inspect(pair[1]));
		t.notOk(isSameType(pair[1], pair[0]), inspect(pair[1]) + ' is not the same type as ' + inspect(pair[0]));
	});

	t.end();
});

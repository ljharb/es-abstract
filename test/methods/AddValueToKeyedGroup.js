'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

module.exports = function (t, year, AddValueToKeyedGroup) {
	t.ok(year >= 2024, 'ES2024+');

	forEach(v.nonArrays, function (nonArray) {
		t['throws'](
			function () { AddValueToKeyedGroup(nonArray, 'key', 'value'); },
			TypeError,
			debug(nonArray) + ' is not an Array'
		);
	});

	t['throws'](
		function () { AddValueToKeyedGroup([{ keyedGroup: false }], 'key', 'value'); },
		TypeError,
		'`groups` is not a List of keyed groups'
	);

	var groups = [];
	t.equal(AddValueToKeyedGroup(groups, 'key', 'value'), undefined);
	t.deepEqual(groups, [{ '[[Key]]': 'key', '[[Elements]]': ['value'] }], 'first value is added to a new group');

	t.equal(AddValueToKeyedGroup(groups, 'key', 'value2'), undefined);
	t.equal(AddValueToKeyedGroup(groups, 'key2', 'value'), undefined);
	t.deepEqual(
		groups,
		[
			{ '[[Key]]': 'key', '[[Elements]]': ['value', 'value2'] },
			{ '[[Key]]': 'key2', '[[Elements]]': ['value'] }
		],
		'values added to expected groups'
	);
};

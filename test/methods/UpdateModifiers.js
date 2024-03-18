'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

var esV = require('../helpers/v');

module.exports = function (t, year, UpdateModifiers) {
	t.ok(year >= 2025, 'ES2025+');

	forEach(esV.unknowns, function (nonRER) {
		t['throws'](
			function () { UpdateModifiers(nonRER, '', ''); },
			TypeError,
			debug(nonRER) + ' is not a Regular Expression Record'
		);
	});

	var rer = {
		'[[IgnoreCase]]': false,
		'[[Multiline]]': false,
		'[[DotAll]]': true,
		'[[Unicode]]': false,
		'[[UnicodeSets]]': false,
		'[[CapturingGroupsCount]]': 0
	};

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			function () { UpdateModifiers(rer, nonString, ''); },
			TypeError,
			'add: ' + debug(nonString) + ' is not a string'
		);

		t['throws'](
			function () { UpdateModifiers(rer, '', nonString); },
			TypeError,
			'remove: ' + debug(nonString) + ' is not a string'
		);
	});

	t['throws'](
		function () { UpdateModifiers(rer, 'ai', 'bi'); },
		TypeError,
		'add and remove have elements in common'
	);

	t.deepEqual(
		UpdateModifiers(rer, '', ''),
		rer,
		'no changes'
	);

	t.deepEqual(
		UpdateModifiers(rer, 'mi', 's'),
		{
			'[[IgnoreCase]]': true,
			'[[Multiline]]': true,
			'[[DotAll]]': false,
			'[[Unicode]]': false,
			'[[UnicodeSets]]': false,
			'[[CapturingGroupsCount]]': 0
		},
		'add mi, remove s'
	);

	rer['[[DotAll]]'] = false;
	rer['[[Multiline]]'] = true;
	rer['[[IgnoreCase]]'] = true;
	t.deepEqual(
		UpdateModifiers(rer, 's', 'mi'),
		{
			'[[IgnoreCase]]': false,
			'[[Multiline]]': false,
			'[[DotAll]]': true,
			'[[Unicode]]': false,
			'[[UnicodeSets]]': false,
			'[[CapturingGroupsCount]]': 0
		},
		'add s, remove mi'
	);
};

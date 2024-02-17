'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var CharSet = require('../../helpers/CharSet').CharSet;
var esV = require('../helpers/v');

var check = function check(t, cs, name) {
	t.ok(cs instanceof CharSet, 'nonUnicode CharSet');
	var count = 0;
	cs.yield(function () { count += 1; });
	t.equal(count, cs.count(), name + ' RER yields the expected number of code points');
};

module.exports = function (t, year, AllCharacters) {
	t.ok(year >= 2024, 'ES2024+');

	forEach(esV.unknowns, function (nonRER) {
		t['throws'](
			function () { AllCharacters(nonRER); },
			TypeError,
			debug(nonRER) + ' is not a Regular Expression Record'
		);
	});

	var nonUnicode = {
		'[[IgnoreCase]]': false,
		'[[Multiline]]': false,
		'[[DotAll]]': false,
		'[[Unicode]]': false,
		'[[CapturingGroupsCount]]': 0
	};
	var unicode = {
		'[[IgnoreCase]]': false,
		'[[Multiline]]': false,
		'[[DotAll]]': false,
		'[[Unicode]]': true,
		'[[CapturingGroupsCount]]': 0
	};
	var nonUnicodeSets = {
		'[[IgnoreCase]]': false,
		'[[Multiline]]': false,
		'[[DotAll]]': false,
		'[[Unicode]]': false,
		'[[UnicodeSets]]': false,
		'[[CapturingGroupsCount]]': 0
	};
	var unicodeSets = {
		'[[IgnoreCase]]': false,
		'[[Multiline]]': false,
		'[[DotAll]]': false,
		'[[Unicode]]': false,
		'[[UnicodeSets]]': true,
		'[[CapturingGroupsCount]]': 0
	};
	var unicodeSetsIC = {
		'[[IgnoreCase]]': true,
		'[[Multiline]]': false,
		'[[DotAll]]': false,
		'[[Unicode]]': false,
		'[[UnicodeSets]]': true,
		'[[CapturingGroupsCount]]': 0
	};

	check(t, AllCharacters(nonUnicode), 'nonUnicode');
	check(t, AllCharacters(unicode), 'unicode');
	check(t, AllCharacters(nonUnicodeSets), 'nonUnicodeSets');
	check(t, AllCharacters(unicodeSets), 'unicodeSets');
	check(t, AllCharacters(unicodeSetsIC), 'unicodeSets ignore case');
};

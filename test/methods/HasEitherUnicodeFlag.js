'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'HasEitherUnicodeFlag'>} */
module.exports = function (t, year, HasEitherUnicodeFlag) {
	t.ok(year >= 2024, 'ES2024+');

	forEach(esV.unknowns, function (nonRER) {
		t['throws'](
			// @ts-expect-error
			function () { HasEitherUnicodeFlag(nonRER); },
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

	t.equal(HasEitherUnicodeFlag(nonUnicode), false);
	t.equal(HasEitherUnicodeFlag(unicode), true);

	t.equal(HasEitherUnicodeFlag(nonUnicodeSets), false);
	t.equal(HasEitherUnicodeFlag(unicodeSets), true);
};

'use strict';

var assign = require('object.assign');
var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

var esV = require('../helpers/v');

module.exports = function (t, year, actual) {
	t.ok(year >= 2017, 'ES2017+');

	var WordCharacters = year >= 2023 ? actual : function WordCharacters(rer) {
		return actual(rer['[[IgnoreCase]]'], rer['[[Unicode]]']);
	};

	if (year >= 2023) {
		forEach(esV.unknowns, function (nonRER) {
			t['throws'](
				function () { WordCharacters(nonRER); },
				TypeError,
				debug(nonRER) + ' is not a RegularExpressionRecord'
			);
		});
	}

	var rer = {
		'[[IgnoreCase]]': false,
		'[[Multiline]]': false,
		'[[DotAll]]': false,
		'[[Unicode]]': false,
		'[[CapturingGroupsCount]]': 1
	};

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			function () { WordCharacters(assign({}, rer, { '[[IgnoreCase]]': nonBoolean })); },
			TypeError,
			'[[IgnoreCase]]: ' + debug(nonBoolean) + ' is not a Boolean'
		);

		t['throws'](
			function () { WordCharacters(assign({}, rer, { '[[Unicode]]': nonBoolean })); },
			TypeError,
			'[[Unicode]]: ' + debug(nonBoolean) + ' is not a Boolean'
		);
	});

	t.equal(
		WordCharacters(rer),
		'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_',
		'not both true gives a-zA-Z0-9_'
	);
	t.equal(
		WordCharacters(assign({}, rer, { '[[Unicode]]': true })),
		'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_',
		'not both true gives a-zA-Z0-9_'
	);
	t.equal(
		WordCharacters(assign({}, rer, { '[[IgnoreCase]]': true })),
		'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_',
		'not both true gives a-zA-Z0-9_'
	);

	t.equal(
		WordCharacters(assign({}, rer, { '[[IgnoreCase]]': true, '[[Unicode]]': true })),
		'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_',
		'both true gives a-zA-Z0-9_'
	);
};

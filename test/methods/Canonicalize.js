'use strict';

var assign = require('object.assign');
var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');
var keys = require('object-keys');

var caseFolding = require('../../helpers/caseFolding.json');

var esV = require('../helpers/v');

module.exports = function (t, year, actual) {
	t.ok(year >= 5, 'ES5+');

	var Canonicalize = year >= 2023
		? actual
		: year >= 2015
			? function Canonicalize(rer, ch) {
				return actual(ch, rer['[[IgnoreCase]]'], rer['[[Unicode]]']);
			}
			: function Canonicalize(rer, ch) {
				return actual(ch, rer['[[IgnoreCase]]']);
			};

	var rer = {
		'[[IgnoreCase]]': false,
		'[[Multiline]]': false,
		'[[DotAll]]': false,
		'[[Unicode]]': false,
		'[[CapturingGroupsCount]]': 1
	};

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			function () { Canonicalize(rer, nonString); },
			TypeError,
			'ch: ' + debug(nonString) + ' is not a String'
		);
	});

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			function () { Canonicalize(assign({}, rer, { '[[IgnoreCase]]': nonBoolean }), ''); },
			TypeError,
			'IgnoreCase: ' + debug(nonBoolean) + ' is not a Boolean'
		);

		if (year >= 2015) {
			t['throws'](
				function () { Canonicalize(assign({}, rer, { '[[Unicode]]': nonBoolean }), ''); },
				TypeError,
				'Unicode: ' + debug(nonBoolean) + ' is not a Boolean'
			);
		}
	});

	t.equal(Canonicalize(rer, esV.poo.leading), esV.poo.leading, 'when IgnoreCase is false, ch is returned');
	t.equal(Canonicalize(assign({}, rer, { '[[IgnoreCase]]': true }), 'ƒ'), 'Ƒ', 'when IgnoreCase is true, ch is canonicalized');

	if (year >= 2015) {
		forEach(keys(caseFolding.C), function (input) {
			var output = caseFolding.C[input];
			t.equal(
				Canonicalize(assign({}, rer, { '[[Unicode]]': true }), input),
				input,
				'C mapping, IgnoreCase false: ' + debug(input) + ' canonicalizes to ' + debug(input)
			);
			t.equal(
				Canonicalize(assign({}, rer, { '[[IgnoreCase]]': true, '[[Unicode]]': true }), input),
				output,
				'C mapping, IgnoreCase true: ' + debug(input) + ' canonicalizes to ' + debug(output)
			);
		});

		forEach(keys(caseFolding.S), function (input) {
			var output = caseFolding.S[input];
			t.equal(
				Canonicalize(assign({}, rer, { '[[Unicode]]': true }), input),
				input,
				'S mapping, IgnoreCase false: ' + debug(input) + ' canonicalizes to ' + debug(input)
			);
			t.equal(
				Canonicalize(assign({}, rer, { '[[IgnoreCase]]': true, '[[Unicode]]': true }), input),
				output,
				'S mapping, IgnoreCase true: ' + debug(input) + ' canonicalizes to ' + debug(output)
			);
		});
	}
};

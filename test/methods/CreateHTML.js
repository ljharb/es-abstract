'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'CreateHTML'>} */
module.exports = function (t, year, CreateHTML) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			// @ts-expect-error
			function () { CreateHTML('', nonString, '', ''); },
			TypeError,
			'tag: ' + debug(nonString) + ' is not a String'
		);
		t['throws'](
			// @ts-expect-error
			function () { CreateHTML('', '', nonString, ''); },
			TypeError,
			'attribute: ' + debug(nonString) + ' is not a String'
		);
	});

	t.equal(
		CreateHTML(
			{ toString: function () { return 'the string'; } },
			'some HTML tag!',
			'',
			''
		),
		'<some HTML tag!>the string</some HTML tag!>',
		'works with an empty string attribute value'
	);

	t.equal(
		CreateHTML(
			{ toString: function () { return 'the string'; } },
			'some HTML tag!',
			'attr',
			'value "with quotes"'
		),
		'<some HTML tag! attr="value &quot;with quotes&quot;">the string</some HTML tag!>',
		'works with an attribute, and a value with quotes'
	);
};

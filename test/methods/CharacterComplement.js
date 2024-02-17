'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var callBind = require('call-bind');

var CharSet = require('../../helpers/CharSet');
var esV = require('../helpers/v');

module.exports = function (t, year, CharacterComplement) {
	t.ok(year >= 2024, 'ES2024+');

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

	forEach(esV.unknowns, function (non) {
		t['throws'](
			function () { CharacterComplement(non, new CharSet.CharSet(function () {}, function () {})); },
			TypeError,
			debug(non) + ' is not a Regular Expression Record'
		);
	});

	forEach(esV.unknowns, function (non) {
		t['throws'](
			function () { CharacterComplement(nonUnicode, non); },
			TypeError,
			debug(non) + ' is not a CharSet'
		);
	});

	var A = CharSet.getCodePoints();

	var lowercaseOnly = new CharSet.CharSet(
		function (x) { return x.toLowerCase() === x; },
		function (emit) {
			var test = callBind(this.test, this);
			A.yield(function (x) {
				if (test(x)) {
					emit(x);
				}
			});
		}
	);

	var nuCC = CharacterComplement(nonUnicode, lowercaseOnly);
	var uCC = CharacterComplement(unicode, lowercaseOnly);

	t.notEqual(A.count(), nuCC.count(), 'non-unicode: nonzero characters filtered out');
	t.notEqual(A.count(), uCC.count(), 'unicode: nonzero characters filtered out');
	t.notEqual(nuCC.count(), uCC.count(), 'unicode and non-unicode: different char counts');

	t.notOk(nuCC.test('a'), 'non-unicode: lowercase a');
	t.notOk(nuCC.test('A'), 'non-unicode: uppercase a');
	t.notOk(uCC.test('a'), 'unicode: lowercase a');
	t.ok(uCC.test('A'), 'unicode: uppercase a');
};

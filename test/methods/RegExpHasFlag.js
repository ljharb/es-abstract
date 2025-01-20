'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var isRegex = require('is-regex');
var supportedRegexFlags = require('available-regexp-flags');
var v = require('es-value-fixtures');

// in node < 6, RegExp.prototype is an actual regex
var reProtoIsRegex = isRegex(RegExp.prototype);

module.exports = function (t, year, RegExpHasFlag) {
	t.ok(year >= 2022, 'ES2022+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { RegExpHasFlag(primitive, 'x'); },
			TypeError,
			'R must be an Object; ' + debug(primitive) + ' is not one'
		);
	});

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			function () { return RegExpHasFlag({}, nonString); },
			TypeError,
			debug(nonString) + ' is not a string'
		);
	});

	t.equal(
		RegExpHasFlag(RegExp.prototype, 'x'),
		reProtoIsRegex ? false : undefined,
		'RegExp.prototype yields ' + (reProtoIsRegex ? 'false' : 'undefined')
	);

	t['throws'](
		function () { return RegExpHasFlag({}, 'x'); },
		TypeError,
		'non-RegExp object throws TypeError'
	);

	var allFlagsU = new RegExp('a', supportedRegexFlags.join('').replace('uv', 'u'));
	var allFlagsV = new RegExp('a', supportedRegexFlags.join('').replace('uv', 'v'));
	forEach(supportedRegexFlags, function (flag) {
		t.equal(RegExpHasFlag(/a/, flag), false, 'regex with no flags does not have flag ' + flag);

		var r = new RegExp('a', flag);
		t.equal(RegExpHasFlag(r, flag), true, debug(r) + ' has flag ' + flag);

		if (allFlagsU !== allFlagsV && (flag === 'u' || flag === 'v')) {
			var flagsSubset = flag === 'u' ? allFlagsU : allFlagsV;
			t.equal(RegExpHasFlag(flagsSubset, flag), true, debug(flagsSubset) + ' has flag ' + flag);
		} else {
			t.equal(RegExpHasFlag(allFlagsU, flag), true, debug(allFlagsU) + ' has flag ' + flag);
		}
	});
};

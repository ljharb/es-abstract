'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

module.exports = function (t, year, IsTimeZoneOffsetString) {
	t.ok(year >= 2023, 'ES2023+');

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			function () { IsTimeZoneOffsetString(nonString); },
			TypeError,
			debug(nonString) + ' is not a string'
		);
	});

	for (var i = 0; i < 24; i++) {
		var paddedH = ('00' + i).slice(-2);
		var strHP = '+' + paddedH + ':00';
		t.equal(IsTimeZoneOffsetString(strHP), true, debug(strHP) + ' is a valid time zone offset string');

		var strHN = '-' + paddedH + ':00';
		t.equal(IsTimeZoneOffsetString(strHN), true, debug(strHN) + ' is a valid time zone offset string');
	}

	for (var m = 0; m < 60; m++) {
		var paddedM = ('00' + m).slice(-2);
		var strMP = '+00:' + paddedM;
		t.equal(IsTimeZoneOffsetString(strMP), true, debug(strMP) + ' is a valid time zone offset string');

		var strMN = '-00:' + paddedM;
		t.equal(IsTimeZoneOffsetString(strMN), true, debug(strMN) + ' is a valid time zone offset string');
	}

	forEach([
		'+24:00',
		'-24:00',
		'+00:60',
		'-00:60'
	], function (tzos) {
		t.equal(IsTimeZoneOffsetString(tzos), false, debug(tzos) + ' is not a valid time zone offset string');
	});
};

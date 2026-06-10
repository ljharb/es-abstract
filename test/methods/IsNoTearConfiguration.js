'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var specEnum = require('../../helpers/specEnum');

var esV = require('../helpers/v');

module.exports = function (t, year, IsNoTearConfiguration) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(esV.getUnclampedIntegerTypes(year), function (type) {
		var typeForYear = specEnum(year, type.toLowerCase());
		t.equal(
			IsNoTearConfiguration(typeForYear),
			true,
			debug(typeForYear) + ' with any order is a no-tear configuration'
		);
	});

	forEach(esV.getBigIntTypes(year), function (type) {
		var typeForYear = specEnum(year, type.toLowerCase());
		t.equal(
			IsNoTearConfiguration(typeForYear, specEnum(year, 'init')),
			false,
			debug(typeForYear) + ' with ' + debug('Init') + ' is not a no-tear configuration'
		);

		t.equal(
			IsNoTearConfiguration(typeForYear, specEnum(year, 'unordered')),
			false,
			debug(typeForYear) + ' with ' + debug('Unordered') + ' is not a no-tear configuration'
		);

		t.equal(
			IsNoTearConfiguration(typeForYear),
			true,
			debug(typeForYear) + ' with any other order is a no-tear configuration'
		);
	});

	forEach(esV.getClampedTypes(year), function (type) {
		var typeForYear = specEnum(year, type.toLowerCase());
		t.equal(
			IsNoTearConfiguration(typeForYear),
			false,
			debug(typeForYear) + ' with any order is not a no-tear configuration'
		);
	});
};

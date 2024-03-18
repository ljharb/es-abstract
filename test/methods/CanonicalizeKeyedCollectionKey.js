'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

module.exports = function (t, year, CanonicalizeKeyedCollectionKey) {
	t.equal(CanonicalizeKeyedCollectionKey(0), 0, '+0 yields +0');
	t.equal(CanonicalizeKeyedCollectionKey(-0), 0, '-0 yields +0');

	forEach(v.primitives.concat(v.objects), function (nonZero) {
		if (nonZero !== 0) {
			t.equal(CanonicalizeKeyedCollectionKey(nonZero), nonZero, debug(nonZero) + ' is itself');
		}
	});
};

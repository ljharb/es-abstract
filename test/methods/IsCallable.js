'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

module.exports = function (t, year, IsCallable) {
	t.ok(year >= 5, 'ES5+');

	t.equal(true, IsCallable(function () {}), 'function is callable');
	var nonCallables = [].concat(
		/a/g,
		{},
		Object.prototype,
		NaN,
		v.nonFunctions
	);

	forEach(nonCallables, function (nonCallable) {
		t.equal(false, IsCallable(nonCallable), debug(nonCallable) + ' is not callable');
	});
};

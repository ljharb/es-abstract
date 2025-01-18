'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'IsPromise'>} */
module.exports = function (t, year, IsPromise) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(esV.unknowns, function (nonPromise) {
		t.equal(IsPromise(nonPromise), false, debug(nonPromise) + ' is not a Promise');
	});

	t.test('Promises supported', { skip: typeof Promise !== 'function' }, function (st) {
		var thenable = { then: Promise.prototype.then };
		st.equal(IsPromise(thenable), false, 'generic thenable is not a Promise');

		st.equal(IsPromise(Promise.resolve()), true, 'Promise is a Promise');

		st.end();
	});
};

'use strict';

/** @type {import('../testHelpers').MethodTest<'GetGlobalObject'>} */
module.exports = function (t, year, GetGlobalObject) {
	t.ok(year >= 2015, 'ES2015+');

	t.equal(GetGlobalObject(), global, 'returns the global object');
};

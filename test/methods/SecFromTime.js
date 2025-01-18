'use strict';

/** @type {import('../testHelpers').MethodTest<'SecFromTime'>} */
module.exports = function (t, year, SecFromTime) {
	t.ok(year >= 5, 'ES5+');

	var now = new Date();
	t.equal(SecFromTime(now.getTime()), now.getUTCSeconds(), 'second from Date timestamp matches getUTCSeconds');
};

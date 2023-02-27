'use strict';

/** @type {(this: import('tape').Test, fn: Function, sentinel: unknown, message: string) => void} */
module.exports = function throwsSentinel(fn, sentinel, message) {
	try {
		fn();
		this.fail('did not throw: ' + message);
	} catch (e) {
		this.equal(e, sentinel, message);
	}
};

'use strict';

module.exports = function throwsSentinel(fn, sentinel, message) {
	try {
		fn();
		this.fail('did not throw: ' + message);
	} catch (e) {
		this.equal(e, sentinel, message);
	}
};

'use strict';

var GetIntrinsic = require('get-intrinsic');

var $Array = GetIntrinsic('%Array%');

/** @type {false | ((thisArg: unknown) => string)} */
// eslint-disable-next-line global-require
var toStr = !$Array.isArray && require('call-bound')('Object.prototype.toString');

/** @type {(argument: unknown) => argument is unknown[]} */
module.exports = $Array.isArray
	|| function IsArray(argument) {
		// eslint-disable-next-line no-extra-parens
		return /** @type {Exclude<typeof toStr, false>} */ (toStr)(argument) === '[object Array]';
	};

'use strict';

var GetIntrinsic = require('get-intrinsic');

var $preventExtensions = GetIntrinsic('%Object.preventExtensions%', true);
var $isExtensible = GetIntrinsic('%Object.isExtensible%', true);

var isPrimitive = require('../helpers/isPrimitive');

// https://262.ecma-international.org/6.0/#sec-isextensible-o

module.exports = $preventExtensions && $isExtensible
	? /** @type {(obj: unknown) => boolean} */ function IsExtensible(obj) {
		return !isPrimitive(obj)
			// @ts-expect-error TS can't narrow properly in a closure
			&& $isExtensible(obj);
	}
	: /** @type {(obj: unknown) => boolean} */ function IsExtensible(obj) {
		return !isPrimitive(obj);
	};

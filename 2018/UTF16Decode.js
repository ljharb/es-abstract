'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

// https://262.ecma-international.org/7.0/#sec-utf16decode

var isLeadingSurrogate = require('../helpers/isLeadingSurrogate');
var isTrailingSurrogate = require('../helpers/isTrailingSurrogate');

// https://262.ecma-international.org/11.0/#sec-utf16decodesurrogatepair

module.exports = function UTF16Decode(lead, trail) {
	if (!isLeadingSurrogate(lead) || !isTrailingSurrogate(trail)) {
		throw new $TypeError('Assertion failed: `lead` must be a leading surrogate char code, and `trail` must be a trailing surrogate char code');
	}
	return ((lead - 0xD800) * 0x400) + (trail - 0xDC00) + 0x10000;
};

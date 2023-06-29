'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

var isLeadingSurrogate = require('../helpers/isLeadingSurrogate');
var isTrailingSurrogate = require('../helpers/isTrailingSurrogate');

// https://tc39.es/ecma262/2020/#sec-utf16decodesurrogatepair

module.exports = function UTF16SurrogatePairToCodePoint(lead, trail) {
	if (!isLeadingSurrogate(lead) || !isTrailingSurrogate(trail)) {
		throw new $TypeError('Assertion failed: `lead` must be a leading surrogate char code, and `trail` must be a trailing surrogate char code');
	}
	return ((lead - 0xD800) * 0x400) + (trail - 0xDC00) + 0x10000;
};

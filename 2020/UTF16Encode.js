'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

var isCodePoint = require('../helpers/isCodePoint');
var every = require('../helpers/every');

var IsArray = require('./IsArray');
var UTF16Encoding = require('./UTF16Encoding');

// https://262.ecma-international.org/11.0/#sec-utf16encode

module.exports = function UTF16Encode(text) {
	if (!IsArray(text) || !every(text, isCodePoint)) {
		throw new $TypeError('Assertion failed: `text` must be a List of Unicode code points (>= 0 and <= 0x10FFFF)');
	}

	var result = '';
	for (var i = 0; i < text.length; i += 1) {
		console.log(text[i].toString(16), UTF16Encoding(text[i]));
		result += UTF16Encoding(text[i]);
	}
	return result;
};

'use strict';

var GetIntrinsic = require('get-intrinsic');

var $String = GetIntrinsic('%String%');
var $TypeError = require('es-errors/type');

var Type = require('./Type');

// https://262.ecma-international.org/9.0/#sec-tostring-applied-to-the-number-type

module.exports = function NumberToString(m) {
	if (Type(m) !== 'Number') {
		throw new $TypeError('Assertion failed: "m" must be a String');
	}

	return $String(m);
};


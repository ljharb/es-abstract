'use strict';

var $TypeError = require('es-errors/type');

var ToInt32 = require('./ToInt32');
var ToUint32 = require('./ToUint32');

var Enum = require('../helpers/enum');

var amp = Enum.define('&');
var pipe = Enum.define('|');
var caret = Enum.define('^');

var ops = [amp, pipe, caret];

// https://262.ecma-international.org/11.0/#sec-numberbitwiseop

module.exports = function NumberBitwiseOp(op, x, y) {
	var opEnum = Enum.validate('op', ops, op);

	if (typeof x !== 'number' || typeof y !== 'number') {
		throw new $TypeError('Assertion failed: `x` and `y` arguments must be Numbers');
	}
	var lnum = ToInt32(x);
	var rnum = ToUint32(y);

	if (opEnum === amp) {
		return lnum & rnum;
	}
	if (opEnum === pipe) {
		return lnum | rnum;
	}
	return lnum ^ rnum;
};

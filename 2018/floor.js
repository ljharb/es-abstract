// @ts-nocheck

'use strict';

// var modulo = require('./modulo');
var $floor = require('math-intrinsics/floor');

// http://262.ecma-international.org/5.1/#sec-5.2

/** @type {(x: number) => import('../types').integer} */
module.exports = function floor(x) {
	// return x - modulo(x, 1);
	return $floor(x);
};

'use strict';

var trimStart = require('string.prototype.trimstart');
var trimEnd = require('string.prototype.trimend');

var $TypeError = require('es-errors/type');

var RequireObjectCoercible = require('./RequireObjectCoercible');
var ToString = require('./ToString');

var specEnum = require('../helpers/specEnum');

var year = require('./year');

var START = specEnum(year, 'start');
var END = specEnum(year, 'end');
var START_END = specEnum(year, 'start+end');

// https://262.ecma-international.org/10.0/#sec-trimstring

module.exports = function TrimString(string, where) {
	var str = RequireObjectCoercible(string);
	var S = ToString(str);
	var T;
	if (where === START) {
		T = trimStart(S);
	} else if (where === END) {
		T = trimEnd(S);
	} else if (where === START_END) {
		T = trimStart(trimEnd(S));
	} else {
		throw new $TypeError('Assertion failed: invalid `where` value; must be `' + START + '`, `' + END + '`, or `' + START_END + '`');
	}
	return T;
};

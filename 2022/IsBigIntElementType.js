'use strict';

var specEnum = require('../helpers/specEnum');

var year = require('./year');

var BIGUINT64 = specEnum(year, 'biguint64');
var BIGINT64 = specEnum(year, 'bigint64');

// https://262.ecma-international.org/11.0/#sec-isbigintelementtype

module.exports = function IsBigIntElementType(type) {
	return type === BIGUINT64 || type === BIGINT64;
};

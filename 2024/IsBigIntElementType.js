'use strict';

var specEnum = require('../helpers/specEnum');

var year = require('./year');

var BIGINT64 = specEnum(year, 'bigint64');
var BIGUINT64 = specEnum(year, 'biguint64');

// https://262.ecma-international.org/15.0/#sec-isbigintelementtype

module.exports = function IsBigIntElementType(type) {
	return type === BIGUINT64 || type === BIGINT64;
};

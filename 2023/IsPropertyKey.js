// @ts-nocheck

'use strict';

var isPropertyKey = require('../helpers/isPropertyKey');

// https://262.ecma-international.org/6.0/#sec-ispropertykey

/** @type {(argument: unknown) => argument is (string | symbol)} */
module.exports = function IsPropertyKey(argument) {
	return isPropertyKey(argument);
};

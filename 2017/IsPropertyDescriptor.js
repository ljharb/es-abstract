// @ts-nocheck

'use strict';

// TODO, semver-major: delete this

var isPropertyDescriptor = require('../helpers/records/property-descriptor');

// https://262.ecma-international.org/6.0/#sec-property-descriptor-specification-type

/** @type {(Desc: unknown) => ReturnType<isPropertyDescriptor>} */
module.exports = function IsPropertyDescriptor(Desc) {
	return isPropertyDescriptor(Desc);
};

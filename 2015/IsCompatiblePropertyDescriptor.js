'use strict';

var ValidateAndApplyPropertyDescriptor = require('./ValidateAndApplyPropertyDescriptor');

// https://262.ecma-international.org/6.0/#sec-iscompatiblepropertydescriptor

/** @type {(Extensible: Parameters<ValidateAndApplyPropertyDescriptor>[2], Desc: Parameters<ValidateAndApplyPropertyDescriptor>[3], Current: Parameters<ValidateAndApplyPropertyDescriptor>[4]) => ReturnType<ValidateAndApplyPropertyDescriptor>} */
module.exports = function IsCompatiblePropertyDescriptor(Extensible, Desc, Current) {
	return ValidateAndApplyPropertyDescriptor(undefined, undefined, Extensible, Desc, Current);
};

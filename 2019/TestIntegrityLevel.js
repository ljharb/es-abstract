'use strict';

var $gOPD = require('gopd');
var $TypeError = require('es-errors/type');

var every = require('../helpers/every');
var OwnPropertyKeys = require('own-keys');
var isObject = require('es-object-atoms/isObject');

var IsDataDescriptor = require('./IsDataDescriptor');
var IsExtensible = require('./IsExtensible');
var ToPropertyDescriptor = require('./ToPropertyDescriptor');

var Enum = require('../helpers/enum');

var sealed = Enum.define('sealed');
var frozen = Enum.define('frozen');
var levels = [sealed, frozen];

// https://262.ecma-international.org/6.0/#sec-testintegritylevel

module.exports = function TestIntegrityLevel(O, level) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}
	var levelEnum = Enum.validate('level', levels, level);

	var status = IsExtensible(O);
	if (status || !$gOPD) {
		return false;
	}
	var theKeys = OwnPropertyKeys(O);
	return theKeys.length === 0 || every(theKeys, function (k) {
		var currentDesc = $gOPD(O, k);
		if (typeof currentDesc !== 'undefined') {
			if (currentDesc.configurable) {
				return false;
			}
			if (levelEnum === frozen && IsDataDescriptor(ToPropertyDescriptor(currentDesc)) && currentDesc.writable) {
				return false;
			}
		}
		return true;
	});
};

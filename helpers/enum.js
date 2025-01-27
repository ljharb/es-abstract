'use strict';

/* eslint func-style: 0 */

var $TypeError = require('es-errors/type');
var inspect = require('object-inspect');

var freeze = Object.freeze;

var registry = { __proto__: null };

function SpecEnum(canonical) {
	this.name = canonical;

	if (freeze) {
		freeze(this);
	}

	registry[canonical] = this;
}

SpecEnum.prototype.constructor = void undefined;

SpecEnum.prototype.toString = function toString() {
	return '~' + this.name + '~';
};

if (freeze) {
	freeze(SpecEnum);
	freeze(SpecEnum.prototype);
}

function findEnum(value) {
	if (typeof value === 'string' && value in registry) {
		return registry[value];
	}

	if (value && typeof value === 'object' && value.name in registry && registry[value.name] === value) {
		return value;
	}

	return null;
}

function Enum(value) {
	if (typeof value === 'undefined') {
		return value;
	}

	var found = findEnum(value);
	if (found) {
		return found;
	}

	throw new $TypeError('Unknown spec enum value: ~' + (typeof value === 'string' ? value : inspect(value)) + '~');
}

Enum.define = function define(canonical, aliases) {
	var existingObj = null;
	if (aliases) {
		for (var i = 0; i < aliases.length; i++) {
			var alias = aliases[i];
			if (alias in registry) {
				if (existingObj == null) {
					existingObj = registry[alias];
				} else if (registry[alias] !== existingObj) {
					throw new $TypeError('Conflict: alias "' + alias + '" belongs to a different enum object');
				}
			}
		}
	}

	if (canonical in registry) {
		var canonicalObj = registry[canonical];
		if (!existingObj) {
			existingObj = canonicalObj;
		} else if (canonicalObj !== existingObj) {
			throw new $TypeError('Conflict: canonical name "' + canonical + '" belongs to a different enum object');
		}
	}

	if (existingObj) {
		registry[canonical] = existingObj;
	} else {
		existingObj = new SpecEnum(canonical);
	}

	if (aliases) {
		for (var j = 0; j < aliases.length; j++) {
			var aliasName = aliases[j];
			if (aliasName in registry && registry[aliasName] !== existingObj) {
				throw new $TypeError('Conflict: alias "' + aliasName + '" belongs to a different enum object');
			}
			registry[aliasName] = existingObj;
		}
	}

	return existingObj;
};

Enum.validate = function validate(name, choices, actual) {
	var actualObj = findEnum(actual);

	// 1. Group the choices by canonical object, so duplicates become one group
	var distinctObjs = [];
	var aliasesForObj = []; // parallel array of arrays of strings

	for (var i = 0; i < choices.length; i++) {
		var choiceStrOrObj = choices[i];
		var choiceObj = Enum(choiceStrOrObj);
		var groupIndex = -1;

		for (var j = 0; groupIndex < 0 && j < distinctObjs.length; j++) {
			if (distinctObjs[j] === choiceObj) {
				groupIndex = j;
			}
		}

		if (groupIndex < 0) {
			groupIndex = distinctObjs.length;
			distinctObjs[distinctObjs.length] = choiceObj;
			aliasesForObj[aliasesForObj.length] = [];
		}

		var alias = typeof choiceStrOrObj === 'string'
			? choiceStrOrObj
			: choiceObj.name;

		var arr = aliasesForObj[groupIndex];
		var hasAlias = false;
		for (var p = 0; !hasAlias && p < arr.length; p++) {
			if (arr[p] === alias) {
				hasAlias = true;
			}
		}
		if (!hasAlias) {
			arr[arr.length] = alias;
		}
	}

	if (actualObj) {
		for (var k = 0; k < distinctObjs.length; k++) {
			if (actualObj === distinctObjs[k]) {
				return actualObj;
			}
		}
	}

	var expectedParts = [];
	for (var g = 0; g < distinctObjs.length; g += 1) {
		var groupAliases = aliasesForObj[g];
		var groupString = '';
		for (var q = 0; q < groupAliases.length; q++) {
			if (q > 0) {
				groupString += '~, ~';
			}
			groupString += groupAliases[q];
		}
		expectedParts[expectedParts.length] = '~' + groupString + '~';
	}

	var expectedString = '';
	for (var e = 0; e < expectedParts.length; e += 1) {
		expectedString += (e > 0 ? ', ' : '') + expectedParts[e];
	}
	throw new (arguments.length > 3 ? arguments[3] : $TypeError)('Assertion failed: `' + name + '` must be one of ' + expectedString + '. Received: ' + inspect(actual));
};

module.exports = Enum;

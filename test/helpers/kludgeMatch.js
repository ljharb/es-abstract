'use strict';

var assign = require('object.assign');

var hasLastIndex = 'lastIndex' in (/a/).exec('a'); // IE 8
var hasGroups = 'groups' in (/a/).exec('a'); // modern engines

module.exports = function kludgeMatch(R, matchObject) {
	if (hasGroups) {
		assign(matchObject, { groups: matchObject.groups });
	}
	if (hasLastIndex) {
		assign(matchObject, { lastIndex: matchObject.lastIndex || R.lastIndex });
	} else {
		delete matchObject.lastIndex; // eslint-disable-line no-param-reassign
	}
	return matchObject;
};

'use strict';

var assign = require('object.assign');

// @ts-expect-error no, TS, it can't be null
var hasLastIndex = 'lastIndex' in (/a/).exec('a'); // IE 8
// @ts-expect-error no, TS, it can't be null
var hasGroups = 'groups' in (/a/).exec('a'); // modern engines

/** @type {(R: RegExp, matchObject: { groups?: RegExpExecArray['groups']; index?: number; lastIndex?: number; input: string; }) => typeof matchObject} */
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

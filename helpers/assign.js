'use strict';

var bind = require('function-bind');
var has = bind.call(Function.call, Object.prototype.hasOwnProperty);

var $assign = Object.assign;

module.exports = function assign(target, source) {
	if ($assign) {
		return $assign(target, source);
	}

	// eslint-disable-next-line no-restricted-syntax
	for (var key in source) {
		if (has(source, key)) {
			target[key] = source[key];
		}
	}
	return target;
};

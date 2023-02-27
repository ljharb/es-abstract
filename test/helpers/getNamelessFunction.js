'use strict';

/** @type {() => () => {}} */
module.exports = function getNamelessFunction() {
	var f = Object(function () {});
	try {
		delete f.name;
	} catch (e) { /**/ }
	return f;
};

'use strict';

module.exports = function rerequire() {
	var saved = [];
	for (var i = 0; i < arguments.length; i += 1) {
		saved[saved.length] = {
			path: arguments[i],
			module: require.cache[arguments[i]]
		};
		delete require.cache[arguments[i]];
	}
	return function restoreOriginals() {
		for (var j = 0; j < saved.length; j += 1) {
			require.cache[saved[j].path] = saved[j].module;
		}
		saved.length = 0;
	};
};

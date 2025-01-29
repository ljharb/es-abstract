'use strict';

var glob = require('glob').sync;
var path = require('path');

/** @type {<Y extends import('../testHelpers').TestYear>(year: Y) => import('../testHelpers').AllAONamesForYear<Y>[]} */
module.exports = function getAOs(year) {
	var base = path.join('../..', String(year));
	var files = glob(path.join(base, '**/*.js'), { cwd: __dirname, ignore: [path.join(base, 'tables/**')] });

	/** @type {import('../testHelpers').AllAONamesForYear<typeof year>[]} */
	var methods = [];
	for (var i = 0; i < files.length; i += 1) {
		var file = files[i];
		if (path.basename(file, path.extname(file)) !== 'index') {
			methods[methods.length] = /** @type {import('../testHelpers').AllAONamesForYear<typeof year>} */ (path.relative(base, file).slice(0, -path.extname(file).length).replace('/', '::'));
		}
	}
	methods.sort(function (a, b) { return a.localeCompare(b); });

	return methods;
};

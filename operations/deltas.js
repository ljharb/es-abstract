'use strict';

var diff = require('diff');

var o5 = Object.keys(require('../es5')).sort();
var o2015 = Object.keys(require('./2015')).sort();
var o2016 = Object.keys(require('./2016')).sort();
var o2017 = Object.keys(require('./2017')).sort();
var o2018 = Object.keys(require('./2018')).sort();
var o2019 = Object.keys(require('./2019')).sort();

var results = {
	5: { added: new Set(), removed: new Set() },
	2015: { added: new Set(), removed: new Set() },
	2016: { added: new Set(), removed: new Set() },
	2017: { added: new Set(), removed: new Set() },
	2018: { added: new Set(), removed: new Set() },
	2019: { added: new Set(), removed: new Set() }
};
var parse = function parse(from, to, result) {
	diff.diffArrays(from, to).forEach((x) => {
		x.value.forEach((v) => {
			if (x.added) {
				result.added.add(v);
			}
			if (x.removed) {
				result.removed.add(v);
			}
		});
	});
};
parse(o5, o2015, results[2015]);
parse(o2015, o2016, results[2016]);
parse(o2016, o2017, results[2017]);
parse(o2017, o2018, results[2018]);
parse(o2018, o2019, results[2019]);

module.exports = results;

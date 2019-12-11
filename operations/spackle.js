'use strict';

var path = require('path');
var fs = require('fs');
var childProcess = require('child_process');
var deltas = require('./deltas');

var writtenFiles = [5, 2015, 2016, 2017, 2018, 2019].flatMap((year, i, arr) => {
	if ((i + 1) < arr.length) {
		var ops = fs.readdirSync(path.join(process.cwd(), String(year)));
		return ops.map((opFile) => {
			var op = path.basename(opFile, path.extname(opFile));
			var thisFile = path.join(process.cwd(), String(year), op + '.js');
			var nextYear = arr[i + 1];
			var nextFile = path.join(process.cwd(), String(nextYear), op + '.js');
			if (!deltas[nextYear].removed.has(op) && fs.existsSync(thisFile) && !fs.existsSync(nextFile)) {
				console.log('writing: ' + nextYear + '/' + op + ' -> ' + year + '/' + op);
				var thisSpecifier = '../' + year + '/' + op;
				var reexport = "'use strict';\n\
\n\
module.exports = require('" + thisSpecifier + "');\n\
";
				var replacement = fs.readFileSync(thisFile, 'utf-8');
				fs.writeFileSync(nextFile, process.argv[2] ? replacement : reexport);
				return path.relative(process.cwd(), nextFile);
			}
			return null;
		});
	}
	return [];
}).filter(Boolean);
fs.writeFileSync(path.join(process.cwd(), '.gitattributes'), writtenFiles.map((x) => x + '\tspackled').join('\n'));
childProcess.execSync('git add .gitattributes ' + writtenFiles.join(' '));

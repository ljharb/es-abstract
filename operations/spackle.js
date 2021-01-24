'use strict';

const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const deltas = require('./deltas');
const years = require('./years');

const writtenFiles = [5].concat(years).flatMap((year, i, arr) => {
	if ((i + 1) < arr.length) {
		const ops = fs.readdirSync(path.join(process.cwd(), String(year)));
		return ops.map((opFile) => {
			const op = path.basename(opFile, path.extname(opFile));
			const thisFile = path.join(process.cwd(), String(year), `${op}.js`);
			const nextYear = arr[i + 1];
			const nextFile = path.join(process.cwd(), String(nextYear), `${op}.js`);
			if (!deltas[nextYear].removed.has(op) && fs.existsSync(thisFile) && !fs.existsSync(nextFile)) {
				console.log(`writing: ${nextYear}/${op} -> ${year}/${op}`);
				const thisSpecifier = `../${year}/${op}`;
				const reexport = `'use strict';

module.exports = require('${thisSpecifier}');
`;
				const replacement = fs.readFileSync(thisFile, 'utf-8');
				fs.writeFileSync(nextFile, process.argv[2] ? replacement : reexport);
				return path.relative(process.cwd(), nextFile);
			}
			return null;
		});
	}
	return [];
}).filter(Boolean);
fs.writeFileSync(path.join(process.cwd(), '.gitattributes'), writtenFiles.map((x) => `${x}\tspackled linguist-generated=true`).join('\n'));
childProcess.execSync(`git add .gitattributes ${writtenFiles.join(' ')}`);

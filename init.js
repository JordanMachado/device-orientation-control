const init = require('init-package-json');
const dir = process.cwd();
const initFile = require.resolve('./npm-init.js');
init(dir, initFile, (err, data) => {
	if (!err) console.log('written successfully');
});

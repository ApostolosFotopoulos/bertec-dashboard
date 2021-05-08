const { spawn } = require('child_process');
module.exports = class {
	createForcePlateProcess() {
		console.log("[STATUS]: Force plate service is active");
		const child = spawn('..\\sdk\\BertecForcePlatesFetchData.exe');

		child.stdout.on('data', (data) => {
			//console.log(`stdout:${data}`);
		});

		child.stderr.on('data', (data) => {
			//console.error(`stderr: ${data}`);
		});
	}
};

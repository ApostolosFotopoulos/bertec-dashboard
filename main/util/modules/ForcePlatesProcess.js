const { spawn } = require('child_process');
const path = require('path')
const {  app } = require("electron");

module.exports = class {
	createForcePlateProcess() {
		console.log("[STATUS]: Force plate service is active");
		const child = spawn(
			process.env.NODE_ENV
			? path.resolve(__dirname, '../../sdk/BertecSDK.exe')
			: app.getPath("downloads") + "/.meta/sdk/BertecSDK.exe"
			, ["10"]);

		child.stdout.on('data', (data) => {
			//console.log(`stdout:${data}`);
		});

		child.stderr.on('data', (data) => {
			//console.error(`stderr: ${data}`);
		});
	}
};

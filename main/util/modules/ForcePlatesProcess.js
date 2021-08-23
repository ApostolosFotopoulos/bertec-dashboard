const { spawn } = require('child_process');
const path = require('path')
const {  app } = require("electron");

function createForcePlateProcess() {
		console.log("[STATUS]: Force plate service is active");
		// const child = spawn(
		// 	process.env.NODE_ENV
		// 	? path.resolve(__dirname, '../../sdk/BertecSDK.exe')
		// 	: app.getPath("downloads") + "/.meta/sdk/BertecSDK.exe"
		// 	, ["10"]);
		
		const child2 = spawn(
			process.env.NODE_ENV
			? path.resolve(__dirname, '../../sdk/ForcePlatesConnector.exe')
			: app.getPath("downloads") + "/.meta/sdk/ForcePlatesConnector.exe"
			, ["10"]);

	
		child2.stdout.on('data', (data) => {
			console.log(`stdout:${data}`);
		});

		child2.stderr.on('data', (data) => {
			console.error(`stderr: ${data}`);
		});

		// child.stdout.on('data', (data) => {
		// 	//console.log(`stdout:${data}`);
		// });

		// child.stderr.on('data', (data) => {
		// 	//console.error(`stderr: ${data}`);
		// });
}
createForcePlateProcess();
// module.exports = class {
// 	createForcePlateProcess(cb) {
// 		console.log("[STATUS]: Force plate service is active");
// 		// const child = spawn(
// 		// 	process.env.NODE_ENV
// 		// 	? path.resolve(__dirname, '../../sdk/BertecSDK.exe')
// 		// 	: app.getPath("downloads") + "/.meta/sdk/BertecSDK.exe"
// 		// 	, ["10"]);
		
// 		const child2 = spawn(
// 			process.env.NODE_ENV
// 			? path.resolve(__dirname, '../../sdk/ForcePlatesConnector.exe')
// 			: app.getPath("downloads") + "/.meta/sdk/ForcePlatesConnector.exe"
// 			, ["10"]);

	
// 		child2.stdout.on('data', (data) => {
// 			console.log(`stdout:${data}`);
// 			cb();
// 		});

// 		child2.stderr.on('data', (data) => {
// 			console.error(`stderr: ${data}`);
// 		});

// 		// child.stdout.on('data', (data) => {
// 		// 	//console.log(`stdout:${data}`);
// 		// });

// 		// child.stderr.on('data', (data) => {
// 		// 	//console.error(`stderr: ${data}`);
// 		// });
// 	}
// };

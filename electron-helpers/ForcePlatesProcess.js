const { spawn } = require('child_process');
module.exports = class {
  createForcePlateProcess() {
    const child = spawn(".\\data-fetching\\BertecForcePlatesFetchData.exe");

    child.stdout.on('data', data => {
      console.log(`stdout:${data}`);
    });

    child.stderr.on('data', data => {
      console.error(`stderr: ${data}`);
    });
  }
}
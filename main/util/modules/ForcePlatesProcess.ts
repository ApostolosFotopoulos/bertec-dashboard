const path = require('path');
const { spawn } = require('child_process');
const { app } = require('electron');
const chalk = require('chalk');

/** 
 * Start the force plate setup to connect to the force plate 
 * before the application boot ups.
 */
(async () => {
  try {
    
    await spawn(
      process.env.NODE_ENV == "development"
        ? path.resolve(__dirname, '../../connection/ForcePlatesConnector.exe')
        : app.getPath("downloads") + "/.meta/connection/ForcePlatesConnector.exe"
      , ["10"]
    );
    console.log(chalk.bold.white('[LOG] Force Plate Connector ') + chalk.bold.green('✓'));

  } catch (e) {
    console.log(chalk.bold.red('[ERROR] Force Plate Connector ') + chalk.bold.red('❌'));
  }
})();


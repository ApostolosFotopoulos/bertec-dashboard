const path = require('path');
const { spawn } = require('child_process');
const { app } = require('electron');
const chalk = require('chalk');

class C3DConverter{
  static async run(trial: string, out: string): Promise<void> {
    try {
      await spawn(
        process.env.NODE_ENV == "development"
          ? path.resolve(__dirname, '../../c3d/ConvertC3D.exe')
          : app.getPath("downloads") + "/.meta/c3d/ConvertC3D.exe"
        , [trial, out]
      );
      console.log(chalk.bold.white('[LOG] C3DConverter transform the file correctly.'));
    } catch (e) {
      console.log(chalk.bold.red('[ERROR] C3DConverter failed to transform the file correctly.'));
    }
  }
}

export { C3DConverter }
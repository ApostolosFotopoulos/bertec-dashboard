"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.C3DConverter = void 0;
const path = require('path');
const { spawn } = require('child_process');
const { app } = require('electron');
const chalk = require('chalk');
class C3DConverter {
    static async run(trial, out) {
        try {
            await spawn(process.env.NODE_ENV == "development"
                ? path.resolve(__dirname, '../../c3d/ConvertC3D.exe')
                : app.getPath("downloads") + "/.meta/c3d/ConvertC3D.exe", [trial, out]);
            console.log(chalk.bold.white('[LOG] C3DConverter transform the file correctly.'));
        }
        catch (e) {
            console.log(chalk.bold.red('[ERROR] C3DConverter failed to transform the file correctly.'));
        }
    }
}
exports.C3DConverter = C3DConverter;

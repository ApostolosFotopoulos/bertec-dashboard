const { ipcMain, BrowserWindow } = require('electron');
const path = require('path');

module.exports = class {
	constructor(title, openWindowEvent, closeWindowEvent, urlPath) {
		this.window = null;
		this.title = title;
		this.openWindowEvent = openWindowEvent;
		this.closeWindowEvent = closeWindowEvent;
		this.urlPath = urlPath;
	}

	createWindow() {
		// Create the window with the below specificatins
		this.window = new BrowserWindow({
			width: 1000,
			height: 800,
			minWidth: 1000,
			minHeight: 800,
			title: this.title,
			autoHideMenuBar: true,
			webPreferences: {
				contextIsolation: false,
				nodeIntegration: true,
				devTools: process.env.NODE_ENV === 'development'
			}
		});
		this.window.setTitle(this.title)

		// Load the content
		if (process.env.NODE_ENV === 'development') {
			const winURL = 'http://localhost:1337' + '#' + this.urlPath;
			this.window.loadURL(winURL);
		} else {
			this.window.loadURL('file://' + path.resolve(`${__dirname}`, '../dist/index.html') + '#' + this.urlPath);
		}
		this.window.on('closed', () => {
			this.window = null;
		});
	}
	destroyWindow() {
		if (this.window) {
			this.window.close();
		}
	}
	addEventListener() {
		/** 
    * Event listener that handles the creation of the chart window.
    * After the creation it loads the required content.
    */
		ipcMain.on(this.openWindowEvent, async () => {
			this.createWindow();
		});
		/**
    * Event listener that handles the window destroy
    */
		ipcMain.on(this.closeWindowEvent, async () => {
			this.destroyWindow();
		});
	}
};

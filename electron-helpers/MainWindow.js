const { BrowserWindow, ipcMain, dialog } = require('electron');
const SecondaryWindow = require('./SecondaryWindow');
const ForcePlatesProcess = require('./ForcePlatesProcess');
const fs = require('fs').promises;
const path = require('path');
const events = require('events');
var net = require('net');
const IPCEvents = require('../electron-app/utils/IPCEvents.js');

module.exports = class {
	constructor() {
		// Options
		this.ipcEvents = new IPCEvents();
		this.filePath = '';
		(this.mode = 'Walking'), (this.timeout = 60);
		this.weight = 700;
		this.dataType = 'Normalized';
		this.stepsPerMinuteTarget = 200;
		this.frequency = 100;
		this.threshold = -1;
		this.nOfLines = 10;
		this.socket = null;
		this.isSessionRunning = false;

		// Window Options
		this.cw = null;
		this.cpw = null;
		this.linechartw = null;
		this.timelinew = null;
		this.usersw = null;
		this.createuserw = null;
		this.createtagsw = null;
		this.window = null;

		// TCP / Event Listeners
		this.port = 12345;
		this.ip = '0.0.0.0';
		this.server = new net.Server();
		this.server.listen(this.port, () => {
			console.log('[STATUS] TCP server is active');
		});

		// Start the forceplate process only at windows
		if (process.platform === "win64" || process.platform == "win32") {
			new ForcePlatesProcess().createForcePlateProcess();
		}
	}

	async createWindow() {
		try {
			this.window = new BrowserWindow({
				width: 1000,
				height: 800,
				minWidth: 1000,
				minHeight: 800,
				title: 'Analysis Dashboard',
				autoHideMenuBar: true,
				webPreferences: {
					contextIsolation: false,
					nodeIntegration: true,
					devTools: true
				}
			});

			if (process.env.NODE_ENV === 'development') {
				const winURL = `http://localhost:1337/`;
				this.window.loadURL(winURL);
			} else {
				this.window.loadURL('file://' + path.join(`${__dirname}`, '../dist/index.html'));
			}

			this.addSecondaryWindowsEvents();
			this.startSessionEvents();

			this.window.on('closed', () => {
				if (this.cw.window) {
					this.cw.window.close();
				}
				if (this.linechartw.window) {
					this.linechartw.window.close();
				}
			});
		} catch (e) {
			console.log(e);
		}
	}

	addSecondaryWindowsEvents() {
		// Capture the events
		this.cw = new SecondaryWindow(
			'Speed Meters',
			'OPEN_SPEEDMETER_WINDOW',
			'CLOSE_SPEEDMETER_WINDOW',
			'/speedmeter'
		);
		this.cw.addEventListener();

		this.cpw = new SecondaryWindow('Centers of Pressure', 'OPEN_COP_WINDOW', 'CLOSE_COP_WINDOW', '/cop');
		this.cpw.addEventListener();

		this.linechartw = new SecondaryWindow(
			'Line Charts',
			'OPEN_LINECHART_WINDOW',
			'CLOSE_LINECHART_WINDOW',
			'/linechart'
		);
		this.linechartw.addEventListener();

		this.timelinew = new SecondaryWindow(
			'Timeline',
			'OPEN_TIMELINE_WINDOW',
			'CLOSE_TIMELINE_WINDOW',
			'/timeline'
		);
		this.timelinew.addEventListener();

		this.usersw = new SecondaryWindow('Users Dashboard', 'OPEN_USERS_WINDOW', 'CLOSE_USERS_WINDOW', '/users');
		this.usersw.addEventListener();

		this.createuserw = new SecondaryWindow(
			'User Management',
			'OPEN_USER_MANAGE_WINDOW',
			'CLOSE_USER_MANAGE_WINDOW',
			'/user/manage'
		);
		this.createuserw.addEventListener();

		this.createtagsw = new SecondaryWindow(
			'Tags Management',
			'OPEN_TAG_MANAGE_WINDOW',
			'CLOSE_TAG_MANAGE_WINDOW',
			'/tag/manage'
		);
		this.createtagsw.addEventListener();

		ipcMain.on('WINDOWS_STATUS', async (e) => {
			e.reply('WINDOWS_STATUS_RESPONSE', {
				chartWindowVisible: (this.cw && this.cw.window) !== null,
				copWindowVisible: (this.cpw && this.cpw.window) != null,
				lineChartWindowVisible: (this.linechartw && this.linechartw.window) != null,
				isTimelineVisibile: (this.timelinew && this.timelinew.window) != null
			});
		});
	}

	startSessionEvents() {
		// Start the listener for the IPCEvents

		// Database Events
		this.ipcEvents.createDatabaseEvent();
		this.ipcEvents.deleteDatabaseEvent();
		this.ipcEvents.fetchDatabasesToDeleteEvent(this.window);
		this.ipcEvents.fetchDatabasesToContinueToTrialEvent(this.window);
		this.ipcEvents.fetchDatabasesToTagManagementEvent(this.createtagsw);
		this.ipcEvents.fetchDatabasesToUserManagementEvent(this.createuserw);

		// Users
		this.ipcEvents.fetchUsersToContinueToTrialEvent(this.window);
		this.ipcEvents.createUserEvent();
		this.ipcEvents.fetchAllUsersToViewEvent(this.usersw);
		this.ipcEvents.fetchAllUsersToEditEvent(this.createuserw);
		this.ipcEvents.updateUserEvent();

		// Tags
		this.ipcEvents.createTagEvent();
		this.ipcEvents.deleteTagEvent();
		this.ipcEvents.fetchTagToTagManagementEvent(this.createtagsw);
		this.ipcEvents.fetchTagToUserManagementEvent(this.createuserw);
		this.ipcEvents.fetchAllTagsForUserEvent(this.createuserw);

		this.ipcEvents.queryUsersEvent();

		// Session Events
		ipcMain.on('START_SESSION', (_, d) => {
			const { weight } = d;

			console.log(d);
			// Setup the default setting to start the session
			this.isSessionRunning = true;
			this.weight = Number(weight);
		});

		ipcMain.on('STOP_SESSION', () => {
			// Reset the settings
			this.isSessionRunning = false;
		});

		// Listen for TCP Packets to forward them to the dashboard
		this.server.on('connection', (socket) => {
			this.socket = socket;
			socket.on('data', (packet) => {
				// Retrieve the packet and break to each section
				let packetArray = packet
					.toString()
					.replaceAll(/(\r\n|\n|\r)/gm, '')
					.replaceAll(',', '.')
					.split(';')
					.filter((i, idx) => idx >= 4)
					.map((i) => Number(i));

				// Retrieve the serial numbers of the devices
				let details = packet
					.toString()
					.replaceAll(/(\r\n|\n|\r)/gm, '')
					.replaceAll(',', '.')
					.split(';')
					.filter((i, idx) => idx < 4);

				// Send the data to the linechart window
				if (this.linechartw && this.linechartw.window) {
					if (this.isSessionRunning) {
						this.linechartw.window.webContents.send('SESSION_RESPONSE_LINECHART', {
							rows: packetArray,
							isSessionRunning: this.isSessionRunning,
							weight: this.weight
						});
					} else {
						this.linechartw.window.webContents.send('SESSION_RESPONSE_LINECHART', {
							rows: packetArray,
							isSessionRunning: this.isSessionRunning,
							weight: this.weight
						});
					}
				}

				// Send the data to the COP window
				if (this.cpw && this.cpw.window) {
					if (this.isSessionRunning) {
						this.cpw.window.webContents.send('SESSION_RESPONSE_COP', {
							rows: packetArray,
							isSessionRunning: this.isSessionRunning,
							weight: this.weight
						});
					} else {
						this.cpw.window.webContents.send('SESSION_RESPONSE_COP', {
							rows: [],
							isSessionRunning: this.isSessionRunning,
							weight: this.weight
						});
					}
				}

				// Send the data to the speedmeter window
				if (this.cw && this.cw.window) {
					if (this.isSessionRunning) {
						this.cw.window.webContents.send('SESSION_RESPONSE_SPEEDMETER', {
							rows: packetArray,
							force: Math.random().toFixed(2),
							isSessionRunning: this.isSessionRunning,
							weight: this.weight
						});
					} else {
						this.cw.window.webContents.send('SESSION_RESPONSE_SPEEDMETER', {
							rows: [],
							force: 0,
							isSessionRunning: this.isSessionRunning,
							weight: this.weight
						});
					}
				}

				// Send the data to the timeline window
				if (this.timelinew && this.timelinew.window) {
					if (this.isSessionRunning) {
						this.timelinew.window.webContents.send('SESSION_RESPONSE_TIMELINE', {
							rows: packetArray,
							force: Math.random().toFixed(2),
							isSessionRunning: this.isSessionRunning,
							weight: this.weight
						});
					} else {
						this.timelinew.window.webContents.send('SESSION_RESPONSE_TIMELINE', {
							rows: [],
							force: 0,
							isSessionRunning: this.isSessionRunning,
							weight: this.weight
						});
					}
				}

				// Send the details the main window with the options
				if (this.window) {
					this.window.webContents.send('SESSION_RESPONSE_OPTIONS', {
						rows: packetArray,
						isSessionRunning: this.isSessionRunning,
						weight: this.weight,
						filePath: this.filePath
					});

					// Send the device serial to the dashboard
					this.window.webContents.send('SESSION_DEVICE_DETAILS', {
						deviceLeft: Number(details[1]),
						deviceRight: Number(details[3])
					});
				}

				if (this.createuserw && this.createuserw.window) {
					this.createuserw.window.webContents.send('CREATE_USER_SESSION', {
						rows: packetArray
					});
				}
			});
		});

		ipcMain.on('RESET_FORCE_PLATES', (e, d) => {
			console.log('Tried to reset force plate');
			this.socket.write('RESET_FORCE_PLATES');
		});
	}
};

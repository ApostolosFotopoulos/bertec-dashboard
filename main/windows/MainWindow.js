const { BrowserWindow, ipcMain, dialog } = require("electron");
const SecondaryWindow = require("./SecondaryWindow");
const ForcePlatesProcess = require("../util/ForcePlatesProcess");
const path = require("path");
var net = require("net");
const Events = require('../util/Events');
const IPCEvents = require("../util/IPCEvents.js");
const {
  START_SESSION,
  STOP_SESSION,
  LINECHART_SESSION,
  COP_SESSION,
	SPEEDMETER_SESSION,
	TIMELINE_SESSION,
	SESSION_OPTIONS,
	DEVICE_DETAILS,
	RESET_FORCE_PLATES,
	WINDOWS_STATUS,
	WINDOWS_STATUS_RESPONSE
} = require("../util/types");

module.exports = class {
  constructor() {
    // Options
    this.ipcEvents = new IPCEvents();
    this.weight = 700;
    this.dataType = "Normalized";
    this.stepsPerMinuteTarget = 200;
    this.threshold = -1;
    this.socket = null;
    this.isSessionRunning = false;
    this.selectedDatabase = "";

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
    this.ip = "0.0.0.0";
    this.server = new net.Server();
    this.server.listen(this.port, () => {
      console.log("[STATUS] TCP server is active");
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
        title: "Analysis Dashboard",
        autoHideMenuBar: true,
        webPreferences: {
          contextIsolation: false,
          nodeIntegration: true,
          devTools: true,
        },
      });

      if (process.env.NODE_ENV === "development") {
        const winURL = `http://localhost:1337/`;
        this.window.loadURL(winURL);
      } else {
        this.window.loadURL(
          "file://" + path.join(`${__dirname}`, "../dist/index.html")
        );
      }

      this.addSecondaryWindowsEvents();
      this.startSessionEvents();

      // Close all the secondary windows
      this.window.on("closed", () => {
        if (this.cw.window) {
          this.cw.window.close();
        }
        if (this.cpw.window) {
          this.cpw.window.close();
        }
        if (this.linechartw.window) {
          this.linechartw.window.close();
        }
        if (this.timelinew.window) {
          this.timelinew.window.close();
        }
        if (this.usersw.window) {
          this.usersw.window.close();
        }
        if (this.createuserw.window) {
          this.createuserw.window.close();
        }
        if (this.createuserw.window) {
          this.createuserw.window.close();
        }
        if (this.createtagsw.window) {
          this.createtagsw.window.close();
        }
      });
    } catch (e) {
      throw new Error(e);
    }
  }

  addSecondaryWindowsEvents() {
    // Capture the events
    this.cw = new SecondaryWindow(
      "Speed Meters",
      "OPEN_SPEEDMETER_WINDOW",
      "CLOSE_SPEEDMETER_WINDOW",
      "/speedmeter"
    );
    this.cw.addEventListener();

    this.cpw = new SecondaryWindow(
      "Centers of Pressure",
      "OPEN_COP_WINDOW",
      "CLOSE_COP_WINDOW",
      "/cop"
    );
    this.cpw.addEventListener();

    this.linechartw = new SecondaryWindow(
      "Line Charts",
      "OPEN_LINECHART_WINDOW",
      "CLOSE_LINECHART_WINDOW",
      "/linechart"
    );
    this.linechartw.addEventListener();

    this.timelinew = new SecondaryWindow(
      "Timeline",
      "OPEN_TIMELINE_WINDOW",
      "CLOSE_TIMELINE_WINDOW",
      "/timeline"
    );
    this.timelinew.addEventListener();

    this.usersw = new SecondaryWindow(
      "Users Dashboard",
      "OPEN_USERS_WINDOW",
      "CLOSE_USERS_WINDOW",
      "/users"
    );
    this.usersw.addEventListener();

    this.createuserw = new SecondaryWindow(
      "User Management",
      "OPEN_USER_MANAGE_WINDOW",
      "CLOSE_USER_MANAGE_WINDOW",
      "/user/manage"
    );
    this.createuserw.addEventListener();

    this.createtagsw = new SecondaryWindow(
      "Tags Management",
      "OPEN_TAG_MANAGE_WINDOW",
      "CLOSE_TAG_MANAGE_WINDOW",
      "/tag/manage"
    );
    this.createtagsw.addEventListener();

    ipcMain.on(WINDOWS_STATUS, async (e) => {
      e.reply(WINDOWS_STATUS_RESPONSE, {
        chartWindowVisible: (this.cw && this.cw.window) !== null,
        copWindowVisible: (this.cpw && this.cpw.window) != null,
        lineChartWindowVisible:
          (this.linechartw && this.linechartw.window) != null,
        isTimelineVisibile: (this.timelinew && this.timelinew.window) != null,
      });
    });
  }

  startSessionEvents() {

    // Database Events
    Events.createDatabaseListener(this.window);
    Events.deleteDatabaseListener(this.window);
    Events.fetchDatabasesToDeleteListener(this.window);
    Events.fetchDatabasesToContinueListener(this.window);
    Events.fetchDatabasesToTagsListener(this.createtagsw);
    Events.fetchDatabasesToUsersListener(this.createuserw);
    Events.fetchDatabasesToViewAllListener(this.usersw);

    // Users
    Events.fetchUsersToContinueListener(this.window);
    Events.fetchUsersToViewListener(this.usersw);
    Events.fetchUsersToEditListener(this.createuserw);
    Events.createUserListener(this.createuserw);
    Events.updateUserListener(this.createuserw);
    Events.fetchUsersToViewAllListener(this.usersw);
    Events.deleteUserListener(this.usersw);

    // Tags
    Events.createTagListener(this.createtagsw);
    Events.deleteTagListener(this.createtagsw);
    Events.fetchTagsListener(this.createtagsw);
    Events.fetchTagsToUsersListener(this.createuserw);
    Events.fetchTagsForSpecificUserListener(this.createuserw);
    Events.fetchTagsToViewAllListener(this.usersw);
    
    // Database Events
    //this.ipcEvents.createDatabaseEvent();
    //this.ipcEvents.deleteDatabaseEvent();
    //this.ipcEvents.fetchDatabasesToDeleteEvent(this.window);
    //this.ipcEvents.fetchDatabasesToContinueToTrialEvent(this.window);
    //this.ipcEvents.fetchDatabasesToTagManagementEvent(this.createtagsw);
    //this.ipcEvents.fetchDatabasesToUserManagementEvent(this.createuserw);

    // Users
    //this.ipcEvents.fetchUsersToContinueToTrialEvent(this.window);
    //this.ipcEvents.createUserEvent();
    //this.ipcEvents.fetchAllUsersToViewEvent(this.usersw);
    //this.ipcEvents.fetchAllUsersToEditEvent(this.createuserw);
    //this.ipcEvents.updateUserEvent();

    // Tags
    //this.ipcEvents.createTagEvent();
    //this.ipcEvents.deleteTagEvent();
    //this.ipcEvents.fetchTagToTagManagementEvent(this.createtagsw);
    //this.ipcEvents.fetchTagToUserManagementEvent(this.createuserw);
    //this.ipcEvents.fetchAllTagsForUserEvent(this.createuserw);

    this.ipcEvents.queryUsersEvent();

    // Session Events
    ipcMain.on(START_SESSION, (_, d) => {
      const { weight } = d;

      console.log(d);
      // Setup the default setting to start the session
      this.isSessionRunning = true;
      this.weight = Number(weight);
    });

    ipcMain.on(STOP_SESSION, () => {
      // Reset the settings
      this.isSessionRunning = false;
    });

    // Listen for TCP Packets to forward them to the dashboard
    this.server.on("connection", (socket) => {
      this.socket = socket;
      socket.on("data", (packet) => {
        // Retrieve the packet and break to each section
        let packetArray = packet
          .toString()
          .replaceAll(/(\r\n|\n|\r)/gm, "")
          .replaceAll(",", ".")
          .split(";")
          .filter((i, idx) => idx >= 4)
          .map((i) => Number(i));

        // Retrieve the serial numbers of the devices
        let details = packet
          .toString()
          .replaceAll(/(\r\n|\n|\r)/gm, "")
          .replaceAll(",", ".")
          .split(";")
          .filter((i, idx) => idx < 4);

        // Send the data to the linechart window
        if (this.linechartw && this.linechartw.window) {
          if (this.isSessionRunning) {
            this.linechartw.window.webContents.send(LINECHART_SESSION, {
              rows: packetArray,
              isSessionRunning: this.isSessionRunning,
              weight: this.weight,
            });
          } else {
            this.linechartw.window.webContents.send(LINECHART_SESSION, {
              rows: packetArray,
              isSessionRunning: this.isSessionRunning,
              weight: this.weight,
            });
          }
        }

        // Send the data to the COP window
        if (this.cpw && this.cpw.window) {
          if (this.isSessionRunning) {
            this.cpw.window.webContents.send(COP_SESSION, {
              rows: packetArray,
              isSessionRunning: this.isSessionRunning,
              weight: this.weight,
            });
          } else {
            this.cpw.window.webContents.send(COP_SESSION, {
              rows: [],
              isSessionRunning: this.isSessionRunning,
              weight: this.weight,
            });
          }
        }

        // Send the data to the speedmeter window
        if (this.cw && this.cw.window) {
          if (this.isSessionRunning) {
            this.cw.window.webContents.send(SPEEDMETER_SESSION, {
              rows: packetArray,
              force: Math.random().toFixed(2),
              isSessionRunning: this.isSessionRunning,
              weight: this.weight,
            });
          } else {
            this.cw.window.webContents.send(SPEEDMETER_SESSION, {
              rows: [],
              force: 0,
              isSessionRunning: this.isSessionRunning,
              weight: this.weight,
            });
          }
        }

        // Send the data to the timeline window
        if (this.timelinew && this.timelinew.window) {
          if (this.isSessionRunning) {
            this.timelinew.window.webContents.send(
              TIMELINE_SESSION,
              {
                rows: packetArray,
                force: Math.random().toFixed(2),
                isSessionRunning: this.isSessionRunning,
                weight: this.weight,
              }
            );
          } else {
            this.timelinew.window.webContents.send(
              TIMELINE_SESSION,
              {
                rows: [],
                force: 0,
                isSessionRunning: this.isSessionRunning,
                weight: this.weight,
              }
            );
          }
        }

        // Send the details the main window with the options
        if (this.window) {
          this.window.webContents.send(SESSION_OPTIONS, {
            rows: packetArray,
            isSessionRunning: this.isSessionRunning,
            weight: this.weight,
            filePath: this.filePath,
          });

          // Send the device serial to the dashboard
          this.window.webContents.send(DEVICE_DETAILS, {
            deviceLeft: Number(details[1]),
            deviceRight: Number(details[3]),
          });
        }

        if (this.createuserw && this.createuserw.window) {
          this.createuserw.window.webContents.send(SESSION_OPTIONS, {
            rows: packetArray,
          });
        }
      });
    });

    ipcMain.on(RESET_FORCE_PLATES, (e, d) => {
      if (this.socket) {
        console.log("[STATUS] Tried to reset force plate");
        this.socket.write(RESET_FORCE_PLATES);
      } else {
        console.log("[ERROR] The force plates are not connected")
      }
    });
  }
};

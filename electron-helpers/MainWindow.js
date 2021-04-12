const { BrowserWindow ,ipcMain, dialog } = require('electron')
const SecondaryWindow = require('./SecondaryWindow')
const ForcePlatesProcess = require('./ForcePlatesProcess');
const csv = require('async-csv')
const fs = require('fs').promises
const path = require('path')
const events = require("events");
var net = require("net");

// Global Variables
const SKIP_ENTRIES_SPEEDMETER = 1
const SKIP_ENTRIES_LINECHART = 1
const SKIP_ENTRIES_COPCHART = 1

module.exports = class {
  constructor() {
    // Options
    this.filePath = ""
    this.mode = "Walking",
    this.timeout = 60
    this.weight = 700
    this.dataType = "Normalized"
    this.stepsPerMinuteTarget = 200
    this.frequency = 100
    this.threshold = -1
    this.nOfLines = 10
    this.socket = null
    this.isSessionRunning = false

    // Backend Options
    this.rows = []
    this.nOfStepsSpeedMeter = 0
    this.nOfStepsLineChart = 0
    this.nOfCOPChart = 0
    
    // Window Options
    this.cw = null 
    this.cpw = null
    this.linechartw = null
    this.window = null

    // TCP / Event Listeners
    this.port = 12345
    this.ip =  "0.0.0.0"
    this.server = new net.Server()
    this.server.listen(this.port, () => {
      console.log("TCPListener is active....")
    })
    
    new ForcePlatesProcess().createForcePlateProcess()
  }

  async createWindow() {
    try {
      this.rows = await this.fetchDataFromCSV()
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
      
      if (process.env.NODE_ENV === 'development') {
        const winURL = `http://localhost:8080/`;
        this.window.loadURL(winURL);
      } else {
        this.window.loadURL("file://" + path.join(`${__dirname}`, "../dist/index.html"))
      }

      this.addSecondaryWindowsEvents()
      this.saveFileEvent()
      this.startSessionEvents()

      this.window.on('closed', () => {
        if(this.cw.window){ this.cw.window.close() }
        if(this.linechartw.window){ this.linechartw.window.close() }
      })
    } catch (e) {
      console.log(e)
    }
  }

  addSecondaryWindowsEvents() {

    // Capture the events
    this.cw = new SecondaryWindow("Analysis Dashboard", "OPEN_SPEEDMETER_WINDOW", "CLOSE_SPEEDMETER_WINDOW", "/speedmeter");
    this.cw.addEventListener();

    this.cpw = new SecondaryWindow("Analysis Dashboard", "OPEN_COP_WINDOW", "CLOSE_COP_WINDOW", "/cop");
    this.cpw.addEventListener();

    this.linechartw = new SecondaryWindow("Analysis Dashboard", "OPEN_LINECHART_WINDOW", "CLOSE_LINECHART_WINDOW", "/linechart");
    this.linechartw.addEventListener();

    ipcMain.on('WINDOWS_STATUS', async (e) => {
      e.reply('WINDOWS_STATUS_RESPONSE', { 
        chartWindowVisible: this.cw.window !== null, 
        copWindowVisible: this.cpw.window != null, 
        lineChartWindowVisible: this.linechartw.window != null 
      })
    });
  }

  saveFileEvent() {
    ipcMain.on('FILE_SAVE', async (e) => {
      var options = {
        title: "Save file",
        buttonLabel: "Save",
        defaultPath: `./${new Date().toLocaleString()}.csv`,
        filters: [{
          name: 'CSV',
          extensions: ['csv']
        }]
      }
      // Show dialog
      const res = await dialog.showSaveDialog({
        options,
      });

      // Create the file
      this.filePath = res.filePath
      fs.writeFile(res.filePath, "")
      
      // Reply to the file path event
      e.reply("FILE_SAVE_RESPONSE", { filePath: res.filePath })
    })
  }

  startSessionEvents() {
      
    // Session Events
    ipcMain.on('START_SESSION', (_, d) => {
      const { weight } = d

      console.log(d)
      // Setup the default setting to start the session
      this.isSessionRunning = true
      this.weight = Number(weight);
    })

    ipcMain.on('STOP_SESSION', () => {

      // Reset the settings
      this.isSessionRunning = false
      this.nOfStepsSpeedMeter = 0
      this.nOfStepsLineChart = 0
      this.nOfCOPChart = 0
    })

    // Listen for TCP Packets to forward them to the dashboard
    this.server.on("connection", (socket) => {
      this.socket = socket
      socket.on("data", (packet) => {

        // Retrieve the packet and break to each section
        let packetArray = packet
          .toString()
          .replaceAll(/(\r\n|\n|\r)/gm, "")
          .replaceAll(",",".")
          .split(";")
          .filter((i,idx)=>idx >= 4)
          .map(i=>Number(i))

        // Retrieve the serial numbers of the devices
        let details =   packet
          .toString()
          .replaceAll(/(\r\n|\n|\r)/gm, "")
          .replaceAll(",",".")
          .split(";")
          .filter((i,idx)=>idx < 4)
        
        // Send the data to the linechart window
        if (this.linechartw && this.linechartw.window) {
          if (this.isSessionRunning) {
            this.linechartw.window.webContents.send("SESSION_RESPONSE_LINECHART", {
              rows: packetArray,
              isSessionRunning: this.isSessionRunning,
              weight: this.weight,
            });
          } else {
            this.linechartw.window.webContents.send("SESSION_RESPONSE_LINECHART", {
              rows: packetArray,
              isSessionRunning: this.isSessionRunning,
              weight: this.weight,
            });
          }
        }

        // Send the data to the COP window
        if (this.cpw && this.cpw.window) {
          if (this.isSessionRunning) {
            this.cpw.window.webContents.send("SESSION_RESPONSE_COP", {
              rows: packetArray,
              isSessionRunning: this.isSessionRunning,
              weight: this.weight,
            });
          } else {
            this.cpw.window.webContents.send("SESSION_RESPONSE_COP", {
              rows: [],
              isSessionRunning: this.isSessionRunning,
              weight: this.weight,
            });
          }
        }

        // Send the data to the speedmeter window
        if (this.cw && this.cw.window) {
          if (this.isSessionRunning) {
            this.cw.window.webContents.send("SESSION_RESPONSE_SPEEDMETER", {
              rows: packetArray,
              force: Math.random().toFixed(2),
              isSessionRunning: this.isSessionRunning,
              weight: this.weight,
            });
          } else {
            this.cw.window.webContents.send("SESSION_RESPONSE_SPEEDMETER", {
              rows: [],
              force: 0,
              isSessionRunning: this.isSessionRunning,
              weight: this.weight,
            });
          }
        }
        
        // Send the details the main window with the options
        if(this.window){
          this.window.webContents.send("SESSION_RESPONSE_OPTIONS", {
            rows: packetArray,
            isSessionRunning: this.isSessionRunning,
            weight: this.weight,
            filePath: this.filePath,
          });

          // Send the device serial to the dashboard
          this.window.webContents.send("SESSION_DEVICE_DETAILS", {
            deviceLeft: Number(details[1]),
            deviceRight: Number(details[3])
          });
        }
      
      })
    })
  
    ipcMain.on("RESET_FORCE_PLATES", (e, d) => {
      console.log("Tried to reset force plate")
      this.socket.write("RESET_FORCE_PLATES");
    })

    // SpeedMeter Events
    ipcMain.on("SESSION_RUNNING_SPEEDMETER", (e, d) => {
      if (this.isSessionRunning) {
        e.reply("SESSION_RESPONSE_SPEEDMETER", {
          rows: this.rows[(this.nOfCOPChart) % this.rows.length].map(i=>Number(i)),
          isSessionRunning: this.isSessionRunning,
          weight: this.weight,
          force: Math.random().toFixed(2),
        })
        this.nOfCOPChart = this.nOfCOPChart + SKIP_ENTRIES_LINECHART
      } else {
        this.nOfCOPChart = 0
        e.reply("SESSION_RESPONSE_LINECHART", {
          rows: [],
          force: 0,
          isSessionRunning: this.isSessionRunning,
          weight: this.weight,
        })
      }
    })

    // LineChart Events
    ipcMain.on("SESSION_RUNNING_LINECHART",(e,d)=>{
      if(this.isSessionRunning){
        e.reply("SESSION_RESPONSE_LINECHART",{
          rows: this.rows[(this.nOfStepsLineChart) % this.rows.length].map(i => Number(i)),
          isSessionRunning: this.isSessionRunning,
          weight: this.weight,
          force: Math.random().toFixed(2)
        })
        this.nOfStepsLineChart = this.nOfStepsLineChart + SKIP_ENTRIES_LINECHART
      } else {
        this.nOfStepsLineChart = 0
        e.reply("SESSION_RESPONSE_LINECHART",{
          rows: [],
          isSessionRunning: this.isSessionRunning,
          weight: this.weight,
          force: 0,
        })
      }
    })

    // COP Chart Events
    ipcMain.on("SESSION_RUNNING_COP",(e,d)=>{
      if(this.isSessionRunning){
        e.reply("SESSION_RESPONSE_COP",{
          rows: this.rows[(this.nOfCOPChart) % this.rows.length].map(i => Number(i)),
          isSessionRunning: this.isSessionRunning,
          weight: this.weight,
        })
        this.nOfCOPChart = this.nOfCOPChart + SKIP_ENTRIES_COPCHART
      } else {
        this.nOfCOPChart = 0
        e.reply("SESSION_RESPONSE_COP",{
          rows: [],
          isSessionRunning: this.isSessionRunning,
          weight: this.weight,
        })
      }
    })
  }

  async fetchDataFromCSV() {
    try {
      const csvString = await fs.readFile(path.resolve(__dirname,"../assets/data/run_2belts.csv"));
      let rows = (await csv.parse(csvString)).filter((_,idx)=> idx!=0);
      return rows
    } catch (e) {
      console.log(e)
      return []
    }
  }

}
const { BrowserWindow ,ipcMain, dialog } = require('electron')
const SecondaryWindow = require('./SecondaryWindow')
const TCPListener = require("./TCPListener")
const csv = require('async-csv')
const fs = require('fs').promises
const path = require('path')

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
    this.listener = new TCPListener()
    this.eventListener = this.listener.listen()
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
        if(this.cpw.window){ this.cpw.window.close() }
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
      const { 
        weight, dataType,stepsPerMinuteTarget,
        frequency,threshold,nOfLines
      } = d
      
      console.log(d)
      // Setup the default setting to start the session
      this.isSessionRunning = true
      this.weight = weight
      this.dataType = dataType
      this.stepsPerMinuteTarget = stepsPerMinuteTarget
      this.frequency = frequency
      this.threshold = threshold
      this.nOfLines = nOfLines
    })
    ipcMain.on('STOP_SESSION', () => {

      // Reset the settings
      this.isSessionRunning = false
      this.nOfStepsSpeedMeter = 0
      this.nOfStepsLineChart = 0
      this.nOfCOPChart = 0
    })

    //SpeedMeter Events
    ipcMain.on("SESSION_RUNNING_SPEEDMETER", (e) => {
      if (this.isSessionRunning) {
        e.reply("SESSION_RESPONSE_SPEEDMETER", {
          rows: this.dataType === "Absolute" ? this.rows[(this.nOfStepsSpeedMeter) % this.rows.length] : this.rows[(this.nOfStepsSpeedMeter) % this.rows.length].map(i => (Number(i) / this.weight) * 100),
          force: Math.floor(Math.random() * 100) + 1,
          isSessionRunning: this.isSessionRunning,
          stepsPerMinuteTarget: this.stepsPerMinuteTarget,
          frequency: this.frequency,
          threshold: this.threshold,
          nOfLines: this.nOfLines,
          weight: this.weight,
        })
        this.nOfStepsSpeedMeter = this.nOfStepsSpeedMeter + SKIP_ENTRIES_SPEEDMETER
      } else {
        this.nOfStepsSpeedMeter = 0
        e.reply("SESSION_RESPONSE_SPEEDMETER", {
          rows: [],
          force: 0,
          isSessionRunning: this.isSessionRunning,
        })
      }
    })
  
    // LineChart Events
    ipcMain.on("SESSION_RUNNING_LINECHART",(e,d)=>{
      if(this.isSessionRunning){
        e.reply("SESSION_RESPONSE_LINECHART",{
          rows: this.dataType === "Absolute" ? this.rows[(this.nOfStepsLineChart) % this.rows.length] : this.rows[(this.nOfStepsLineChart) % this.rows.length].map((i, idx) => (idx > 11) ? Number(i) : (Number(i) / this.weight) * 100),
          isSessionRunning: this.isSessionRunning,
          stepsPerMinuteTarget: this.stepsPerMinuteTarget,
          frequency: this.frequency,
          threshold: this.threshold,
          nOfLines: this.nOfLines,
          weight: this.weight,
        })
        this.nOfStepsLineChart = this.nOfStepsLineChart + SKIP_ENTRIES_LINECHART
      } else {
        this.nOfStepsLineChart = 0
        e.reply("SESSION_RESPONSE_LINECHART",{
          rows: [],
          isSessionRunning: this.isSessionRunning,
        })
      }
    })

    // COP Chart Events
    ipcMain.on("SESSION_RUNNING_COP",(e,d)=>{
      if(this.isSessionRunning){
        e.reply("SESSION_RESPONSE_COP",{
          rows: this.dataType === "Absolute" ? this.rows[(this.nOfCOPChart) % this.rows.length] : this.rows[(this.nOfCOPChart) % this.rows.length].map((i,idx) => (idx > 11 )?Number(i):(Number(i) / this.weight) * 100),
          isSessionRunning: this.isSessionRunning,
          stepsPerMinuteTarget: this.stepsPerMinuteTarget,
          frequency: this.frequency,
          threshold: this.threshold,
          nOfLines: this.nOfLines,
          weight: this.weight,
        })
        this.nOfCOPChart = this.nOfCOPChart + SKIP_ENTRIES_COPCHART
      } else {
        this.nOfCOPChart = 0
        e.reply("SESSION_RESPONSE_COP",{
          rows: [],
          isSessionRunning: this.isSessionRunning,
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
const { BrowserWindow ,ipcMain, dialog } = require('electron')
const SecondaryWindow = require('./SecondaryWindow')
const TCPListener = require("./TCPListener")
const csv = require('async-csv')
const fs = require('fs').promises
const path = require('path')
const SKIP_ENTRIES_BARPLOT = 5
const SKIP_ENTRIES_SPEEDMETER = 2
const SKIP_ENTRIES_LINECHART = 1

module.exports = class {
  constructor() {
    this.isSessionRunning = false
    this.weight = 0
    this.nOfStepsBarPlot = 0
    this.nOfStepsLineChart = 0
    this.nOfStepsSpeedMeter= 0
    this.stepsPerMinuteTarget = 0
    this.stepsTimeInteval = 0
    this.frequency = 100
    this.threshold = -1
    this.nOfLines =  12
    this.dataType = "Normalized"
    this.cw = null 
    this.cpw = null
    this.linechartw = null
    this.window = null
    this.rows = []
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
    this.cw = new SecondaryWindow("Analysis Dashboard", "OPEN_BARPLOT_WINDOW", "CLOSE_BARPLOT_WINDOW", "/speedmeter");
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
      fs.writeFile(res.filePath, "")
      
      // Inform the front end
      e.reply("FILE_SAVE_RESPONSE", { filePath: res.filePath })
    })
  }

  startSessionEvents() {
      
    // Session Events
    ipcMain.on('START_SESSION', (_, d) => {
      const { 
        weight, dataType,stepsPerMinuteTarget,stepsTimeInteval,
        frequency,threshold,nOfLines
      } = d 
      console.log(nOfLines)
      this.isSessionRunning = true
      this.weight = weight
      this.dataType = dataType
      this.stepsPerMinuteTarget = stepsPerMinuteTarget
      this.stepsTimeInteval = stepsTimeInteval
      this.frequency = frequency
      this.threshold = threshold
      this.nOfLines = nOfLines
    })
    ipcMain.on('STOP_SESSION', () => {
      this.isSessionRunning = false
    })

     // BarPlot Events
    ipcMain.on("SESSION_RUNNING_BARPLOT",(e,d)=>{
      if(this.isSessionRunning){
        e.reply("SESSION_RESPONSE_BARPLOT",{
          rows: this.dataType === "Absolute" ? this.rows[(this.nOfStepsBarPlot+SKIP_ENTRIES_BARPLOT) % this.rows.length] : this.rows[(this.nOfStepsBarPlot+SKIP_ENTRIES_BARPLOT) % this.rows.length].map(i => (Number(i) / this.weight) * 100),
          force: Math.floor(Math.random() * 100) + 1,
          isSessionRunning: this.isSessionRunning,
          stepsTimeInterval: this.stepsTimeInteval,
          frequency: this.frequency,
          threshold: this.threshold,
          nOfLines: this.nOfLines,
        })
        this.nOfStepsBarPlot = this.nOfStepsBarPlot + SKIP_ENTRIES_BARPLOT
      } else {
        this.nOfStepsBarPlot = 0
        e.reply("SESSION_RESPONSE_BARPLOT",{
          rows: this.dataType === "Absolute" ? this.rows[(this.nOfStepsBarPlot+SKIP_ENTRIES_BARPLOT) % this.rows.length] : this.rows[(this.nOfStepsBarPlot+SKIP_ENTRIES_BARPLOT) % this.rows.length].map(i => (Number(i) / this.weight) * 100),
          force: Math.floor(Math.random() * 100) + 1,
          isSessionRunning: this.isSessionRunning,
          stepsTimeInterval: this.stepsTimeInteval,
          frequency: this.frequency,
          threshold: this.threshold,
          nOfLines: this.nOfLines,
        })
      }
    })

    //SpeedMeter Events
    ipcMain.on("SESSION_RUNNING_SPEEDMETER", (e, d) => {
      if (this.isSessionRunning) {
        e.reply("SESSION_RESPONSE_SPEEDMETER", {
          rows: this.dataType === "Absolute" ? this.rows[(this.nOfStepsSpeedMeter) % this.rows.length] : this.rows[(this.nOfStepsSpeedMeter) % this.rows.length].map(i => (Number(i) / this.weight) * 100),
          force: Math.floor(Math.random() * 100) + 1,
          isSessionRunning: this.isSessionRunning,
          stepsPerMinuteTarget: this.stepsPerMinuteTarget,
          stepsTimeInterval: this.stepsTimeInteval,
          frequency: this.frequency,
          threshold: this.threshold,
          nOfLines: this.nOfLines,
        })
        this.nOfStepsSpeedMeter = this.nOfStepsSpeedMeter + SKIP_ENTRIES_SPEEDMETER
      } else {
        this.nOfStepsSpeedMeter = 0
        e.reply("SESSION_RESPONSE_SPEEDMETER", {
          rows: this.dataType === "Absolute" ? this.rows[(this.nOfStepsSpeedMeter) % this.rows.length] : this.rows[(this.nOfStepsSpeedMeter) % this.rows.length].map(i => (Number(i) / this.weight) * 100),
          force: Math.floor(Math.random() * 100) + 1,
          isSessionRunning: this.isSessionRunning,
          stepsPerMinuteTarget: this.stepsPerMinuteTarget,
          stepsTimeInterval: this.stepsTimeInteval,
          frequency: this.frequency,
          threshold: this.threshold,
          nOfLines: this.nOfLines,
        })
      }
    })

    // LineChart Events
    ipcMain.on("SESSION_RUNNING_LINECHART",(e,d)=>{
      if(this.isSessionRunning){
        const fz1 = this.dataType === "Absolute" ? this.rows[(this.nOfStepsLineChart) % this.rows.length][2] : this.rows[(this.nOfStepsLineChart) % this.rows.length].map(i => (Number(i) / this.weight) * 100)[2]
        const fz2 = this.dataType === "Absolute" ? this.rows[(this.nOfStepsLineChart) % this.rows.length][8] : this.rows[(this.nOfStepsLineChart) % this.rows.length].map(i => (Number(i) / this.weight) * 100)[8]
        console.log(this.nOfStepsLineChart,fz1,fz2,this.frequency,this.threshold,this.nOfLines)
        e.reply("SESSION_RESPONSE_LINECHART",{
          rows: this.dataType === "Absolute" ? this.rows[(this.nOfStepsLineChart) % this.rows.length] : this.rows[(this.nOfStepsLineChart) % this.rows.length].map(i => (Number(i) / this.weight) * 100),
          isSessionRunning: this.isSessionRunning,
          stepsTimeInterval: this.stepsTimeInteval,
          frequency: this.frequency,
          threshold: this.threshold,
          nOfLines: this.nOfLines,
        })
        this.nOfStepsLineChart = this.nOfStepsLineChart + SKIP_ENTRIES_LINECHART
      } else {
        this.nOfStepsLineChart = 0
        e.reply("SESSION_RESPONSE_LINECHART",{
          rows: this.dataType === "Absolute" ? this.rows[(this.nOfStepsLineChart) % this.rows.length] : this.rows[(this.nOfStepsLineChart) % this.rows.length].map(i => (Number(i) / this.weight) * 100),
          isSessionRunning: this.isSessionRunning,
          stepsTimeInterval: this.stepsTimeInteval,
          frequency: this.frequency,
          threshold: this.threshold,
          nOfLines: this.nOfLines,
        })
      }
    })
  }

  async fetchDataFromCSV() {
    try {
      const csvString = await fs.readFile(path.resolve(__dirname,"../test/data/run_2belts.csv"));
      let rows = (await csv.parse(csvString)).filter((_,idx)=> idx!=0);
      return rows
    } catch (e) {
      console.log(e)
      return []
    }
  }

}
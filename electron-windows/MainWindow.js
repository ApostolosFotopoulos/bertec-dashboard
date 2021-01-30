const { BrowserWindow ,ipcMain, dialog } = require('electron')
const SecondaryWindow = require('./SecondaryWindow')
const csv = require('async-csv');
const fs = require('fs').promises;
const path = require('path')

module.exports = class {
  constructor() {
    this.isSessionRunning = false
    this.weight = 0
    this.nOfSteps = 0
    this.cw = null 
    this.cpw = null
    this.window = null
    this.rows = []
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
        this.window = null;
      })
    } catch (e) {
      console.log(e)
    }
  }

  addSecondaryWindowsEvents() {
    // Capture the events
    this.cw = new SecondaryWindow("Analysis Dashboard", "OPEN_CHART_WINDOW", "CLOSE_CHART_WINDOW", "/chart");
    this.cw.addEventListener();

    this.cpw = new SecondaryWindow("Analysis Dashboard", "OPEN_COP_WINDOW", "CLOSE_COP_WINDOW", "/cop");
    this.cpw.addEventListener();

    ipcMain.on('WINDOWS_STATUS', async (e) => {
      e.reply('WINDOWS_STATUS_RESPONSE', { chartWindowVisible: this.cw.window !== null, copWindowVisible: this.cpw.window != null })
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
    ipcMain.on('START_SESSION', (_, d) => {
      const { weight } = d 
      this.isSessionRunning = true
      this.weight = weight
    })
    ipcMain.on('STOP_SESSION', () => {
      this.isSessionRunning = false
    })
    ipcMain.on('IS_SESSION_RUNNING', (e,d) => {
      const { dataType } = d
      if (this.isSessionRunning) {
        e.reply('SESSION_RESPONSE', {
          rows: dataType === "Absolute" ? this.rows[this.nOfSteps % this.rows.length] : this.rows[this.nOfSteps % this.rows.length].map(i => (Number(i) / this.weight) * 100),
          force: Math.floor(Math.random() * 100) + 1,
          nOfSteps: this.nOfSteps,
          isSessionRunning: this.isSessionRunning,
        })
        this.nOfSteps += 1
      } else {
        this.nOfSteps = 0
        e.reply('SESSION_RESPONSE', {
          rows: dataType === "Absolute" ? this.rows[this.nOfSteps % this.rows.length] : this.rows[this.nOfSteps % this.rows.length].map(i => (Number(i) / this.weight) * 100),
          force: Math.floor(Math.random() * 100) + 1,
          nOfSteps: this.nOfSteps,
          isSessionRunning: this.isSessionRunning,
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
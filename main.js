const {
  app, BrowserWindow, ipcMain, dialog,
} = require('electron');

async function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 1000,
    minHeight: 800,
    webPreferences: {
      contextIsolation:false,
      nodeIntegration: true,
      devTools: true,
    },
  });

  win.loadURL(`file://${__dirname}/dist/index.html#/`);
}
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    listener.Destroy();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

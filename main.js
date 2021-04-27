const { app, BrowserWindow } = require("electron");
const MainWindow = require("./electron-helpers/MainWindow");
const mainWindow = new MainWindow();

app.whenReady().then(() => mainWindow.createWindow());

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow.createWindow();
  }
});

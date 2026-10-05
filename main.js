const { app, BrowserWindow } = require('electron');
const path = require('path');
const { startServer } = require('./server');

let mainWindow;
let serverInstance;

async function createWindow() {
  // Gunakan port 5000 atau port bebas jika 5000 dipakai
  const preferredPort = process.env.PORT || 5000;
  let runningPort = preferredPort;

  try {
    const res = await startServer(preferredPort);
    serverInstance = res.server;
    runningPort = res.port;
  } catch (err) {
    // Jika port 5000 dipakai aplikasi lain, pilih port otomatis
    const res = await startServer(0);
    serverInstance = res.server;
    runningPort = serverInstance.address().port;
  }

  mainWindow = new BrowserWindow({
    width: 900,
    height: 760,
    minWidth: 440,
    minHeight: 600,
    title: 'Habit Tracker BiBa',
    autoHideMenuBar: true,
    backgroundColor: '#090a0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL(`http://localhost:${runningPort}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (serverInstance) {
    serverInstance.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

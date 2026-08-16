const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const { autoUpdater } = require('electron-updater');

let mainWindow = null;
let serverProcess = null;
const PORT = 3000;
const SERVER_START_TIMEOUT = 10000;

async function startServer() {
  const serverPath = getServerPath();
  if (!fs.existsSync(serverPath)) {
    console.error('Server bundle not found at:', serverPath);
    return false;
  }

  return new Promise((resolve) => {
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      PORT: PORT.toString(),
      ELECTRON_APP: 'true'
    };

    serverProcess = spawn('node', [serverPath], {
      env,
      cwd: path.dirname(serverPath),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        console.log('Server startup timeout');
        resolve(false);
      }
    }, SERVER_START_TIMEOUT);

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('[Server]', output.trim());
      if (output.includes(`http://localhost:${PORT}`) || output.includes('Server running')) {
        if (!started) {
          started = true;
          clearTimeout(timeout);
          setTimeout(() => resolve(true), 500);
        }
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('[Server Error]', data.toString().trim());
    });

    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
      if (!started) {
        clearTimeout(timeout);
        resolve(false);
      }
    });

    serverProcess.on('error', (err) => {
      console.error('Failed to start server:', err);
      if (!started) {
        clearTimeout(timeout);
        resolve(false);
      }
    });
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'Cordoval OS',
    icon: path.join(__dirname, '..', 'public', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    },
    show: false,
    titleBarStyle: 'default'
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  const appUrl = `http://localhost:${PORT}`;
  
  const loadWithRetry = async (retries = 30) => {
    for (let i = 0; i < retries; i++) {
      try {
        await mainWindow.loadURL(appUrl);
        return;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(r => setTimeout(r, 500));
      }
    }
  };

  await loadWithRetry();
}

async function initializeApp() {
  const serverStarted = await startServer();
  if (!serverStarted) {
    dialog.showErrorBox('Failed to Start', 'Could not start the local server. Please try restarting the app.');
    app.quit();
    return;
  }
  await createWindow();
}

app.whenReady().then(initializeApp);

app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) initializeApp();
});

app.on('before-quit', () => {
  stopServer();
});

ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Cordoval Vault Folder',
    properties: ['openDirectory', 'createDirectory'],
    defaultPath: path.join(os.homedir(), 'Documents')
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('fs:readDir', async (_, dirPath) => {
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    return entries.map(e => ({ name: e.name, isDirectory: e.isDirectory(), isFile: e.isFile() }));
  } catch (err) {
    console.error('fs:readDir error:', err);
    return [];
  }
});

ipcMain.handle('fs:readFile', async (_, filePath) => {
  try {
    return await fs.promises.readFile(filePath, 'utf-8');
  } catch (err) {
    console.error('fs:readFile error:', err);
    return null;
  }
});

ipcMain.handle('fs:writeFile', async (_, filePath, content) => {
  try {
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, content, 'utf-8');
    return true;
  } catch (err) {
    console.error('fs:writeFile error:', err);
    return false;
  }
});

ipcMain.handle('fs:deleteFile', async (_, filePath) => {
  try {
    await fs.promises.unlink(filePath);
    return true;
  } catch (err) {
    console.error('fs:deleteFile error:', err);
    return false;
  }
});

ipcMain.handle('fs:mkdir', async (_, dirPath) => {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
    return true;
  } catch (err) {
    console.error('fs:mkdir error:', err);
    return false;
  }
});

ipcMain.handle('fs:stat', async (_, filePath) => {
  try {
    const stats = await fs.promises.stat(filePath);
    return { isFile: stats.isFile(), isDirectory: stats.isDirectory(), size: stats.size, mtime: stats.mtimeMs };
  } catch (err) {
    return null;
  }
});

ipcMain.handle('app:getVersion', () => app.getVersion());
ipcMain.handle('app:getPath', (_, name) => app.getPath(name));

function sendToRenderer(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
}

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('checking-for-update', () => {
  sendToRenderer('update:status', { status: 'checking' });
});

autoUpdater.on('update-available', (info) => {
  sendToRenderer('update:status', { status: 'available', version: info.version });
});

autoUpdater.on('update-not-available', (info) => {
  sendToRenderer('update:status', { status: 'not-available', version: info.version });
});

autoUpdater.on('download-progress', (progress) => {
  sendToRenderer('update:status', {
    status: 'downloading',
    percent: progress.percent,
    transferred: progress.transferred,
    total: progress.total
  });
});

autoUpdater.on('update-downloaded', (info) => {
  sendToRenderer('update:status', { status: 'downloaded', version: info.version });
});

autoUpdater.on('error', (err) => {
  sendToRenderer('update:status', { status: 'error', message: err.message });
});

ipcMain.handle('update:check', async () => {
  if (!app.isPackaged) {
    sendToRenderer('update:status', { status: 'dev-mode' });
    return { status: 'dev-mode' };
  }
  try {
    await autoUpdater.checkForUpdates();
    return { status: 'checking' };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
});

ipcMain.handle('update:download', async () => {
  try {
    autoUpdater.downloadUpdate();
    return { status: 'downloading' };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
});

ipcMain.handle('update:install', async () => {
  try {
    autoUpdater.quitAndInstall();
    return { status: 'installing' };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
});

ipcMain.handle('update:get-version', () => app.getVersion());

function getServerPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'dist', 'server.cjs');
  }
  return path.join(__dirname, '..', 'dist', 'server.cjs');
}
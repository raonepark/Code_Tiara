const electron = require('electron');
console.log('Electron require type:', typeof electron);
console.log('Electron require value:', electron);
console.log('Versions:', process.versions);
const { app, BrowserWindow, ipcMain } = electron;
const path = require('path');

// Basic dev detection
const isDev = !app.isPackaged;

// ✨ Set App ID for Windows Notifications to show "Code Tiara"
app.setAppUserModelId("Code Tiara");

function createWindow() {
    const win = new BrowserWindow({
        width: 320,
        height: 560,
        useContentSize: true, // This is important for precise sizing
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        autoHideMenuBar: true,
        frame: false, // ✨ Frameless Window
        transparent: true, // ✨ Rounded Corners Support
        backgroundColor: '#00000000', // ✨ Transparent Background
    });

    // Load URL
    // If we are in dev, we load localhost:3000
    // In production, we load the build file
    // We can assume if we are running from 'npm run electron:dev', we want localhost.
    // The environment variable ELECTRON_START_URL can be used if we want to be fancy,
    // but for now let's just use the isDev check or a simple env var.

    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../build/index.html')}`;

    console.log('Loading URL:', startUrl);
    win.loadURL(startUrl);

    // ✨ IPC Handlers for Custom Title Bar
    ipcMain.on('minimize-window', () => {
        win.minimize();
    });

    ipcMain.on('close-window', () => {
        win.close();
    });

    ipcMain.on('maximize-window', () => {
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

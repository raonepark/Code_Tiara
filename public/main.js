const electron = require('electron');
console.log('Electron require type:', typeof electron);
console.log('Electron require value:', electron);
console.log('Versions:', process.versions);
const { app, BrowserWindow, ipcMain, Tray, Menu } = electron;
const path = require('path');

// Basic dev detection
const isDev = !app.isPackaged;

// ✨ Set App ID for Windows Notifications to show "Code Tiara"
app.setAppUserModelId("Code Tiara");

// Global reference for popout windows to prevent garbage collection
const popoutWindows = {};

let mainWindow = null;
let tray = null;
let isQuitting = false;

function createWindow() {
    mainWindow = new BrowserWindow({
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
        icon: path.join(__dirname, '../assets/icons/icon.ico')
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
    mainWindow.loadURL(startUrl);

    // ✨ Prevent window from closing, hide it instead
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    // ✨ IPC Handlers for Custom Title Bar
    ipcMain.on('minimize-window', () => {
        if (mainWindow) mainWindow.minimize();
    });

    ipcMain.on('close-window', () => {
        if (mainWindow) {
            mainWindow.close(); // Triggers the 'close' event above
        }
    });

    ipcMain.on('maximize-window', () => {
        if (mainWindow) {
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            } else {
                mainWindow.maximize();
            }
        }
    });

    // ✨ IPC Handler for Pop-out Windows
    ipcMain.on('open-popout', (event, categoryId) => {
        if (popoutWindows[categoryId]) {
            popoutWindows[categoryId].focus();
            return;
        }

        const popoutWin = new BrowserWindow({
            width: 320,
            height: 400,
            useContentSize: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
            autoHideMenuBar: true,
            frame: false, // Frameless for sticky note look
            transparent: true,
            backgroundColor: '#00000000',
            alwaysOnTop: true, // Always on top as requested
            icon: path.join(__dirname, '../assets/icons/icon.ico')
        });

        popoutWindows[categoryId] = popoutWin;

        popoutWin.on('closed', () => {
            delete popoutWindows[categoryId];
        });

        const popoutUrl = isDev
            ? `http://localhost:3000/?popout=${categoryId}`
            : `file://${path.join(__dirname, '../build/index.html')}?popout=${categoryId}`;

        popoutWin.loadURL(popoutUrl);

        // Debug log
        popoutWin.webContents.on('did-finish-load', () => {
            console.log(`Popout window loaded for category: ${categoryId}`);
        });
    });
    
    ipcMain.on('close-popout', (event) => {
        const webContents = event.sender;
        const winToClose = BrowserWindow.fromWebContents(webContents);
        if (winToClose) {
            winToClose.close();
        }
    });

    ipcMain.on('close-popout-by-id', (event, categoryId) => {
        if (popoutWindows[categoryId]) {
            popoutWindows[categoryId].close();
            delete popoutWindows[categoryId];
        }
    });

    // ✨ Auto-resize popout window based on content
    ipcMain.on('resize-popout-window', (event, { categoryId, width, height }) => {
        if (popoutWindows[categoryId]) {
            popoutWindows[categoryId].setContentSize(width, Math.ceil(height));
        }
    });
}

function createTray() {
    const iconPath = path.join(__dirname, '../assets/icons/icon.ico');
    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
        { label: '열기', click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } } },
        { type: 'separator' },
        { label: '종료', click: () => { isQuitting = true; app.quit(); } }
    ]);

    tray.setToolTip('Code Tiara');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.focus();
            } else {
                mainWindow.show();
                mainWindow.focus();
            }
        }
    });
}

app.whenReady().then(() => {
    createWindow();
    createTray();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    } else {
        mainWindow.show();
    }
});

const electron = require('electron');
console.log('Electron require type:', typeof electron);
console.log('Electron require value:', electron);
console.log('Versions:', process.versions);
const { app, BrowserWindow, ipcMain, Tray, Menu, screen } = electron;
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

    // ✨ Fix: Track normal bounds to restore correctly when dragged from maximized state
    let normalBounds = { width: 320, height: 560 };

    mainWindow.on('resize', () => {
        if (mainWindow && !mainWindow.isMaximized() && !mainWindow.isMinimized()) {
            const bounds = mainWindow.getBounds();
            // Only save if it's a normal size (not fullscreen/snapped bounds which are huge)
            if (bounds.width < screen.getPrimaryDisplay().workAreaSize.width) {
                normalBounds = { width: bounds.width, height: bounds.height };
            }
        }
    });

    mainWindow.on('unmaximize', () => {
        if (mainWindow) {
            const currentBounds = mainWindow.getBounds();
            mainWindow.setBounds({
                x: currentBounds.x,
                y: currentBounds.y,
                width: normalBounds.width,
                height: normalBounds.height
            });
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
    ipcMain.on('open-popout', (event, arg) => {
        let categoryId;
        let isPinned = true;
        if (typeof arg === 'object' && arg !== null) {
            categoryId = arg.categoryId;
            isPinned = arg.isPinned !== undefined ? arg.isPinned : true;
        } else {
            categoryId = arg;
        }

        if (popoutWindows[categoryId]) {
            popoutWindows[categoryId].focus();
            return;
        }
        let spawnX, spawnY;
        if (mainWindow && !mainWindow.isMinimized()) {
            const bounds = mainWindow.getBounds();
            const currentDisplay = screen.getDisplayMatching(bounds);
            spawnX = bounds.x + bounds.width + 15; // 15px to the right
            spawnY = bounds.y;
            
            // Prevent spawning off-screen on the right
            if (spawnX + 320 > currentDisplay.workArea.x + currentDisplay.workArea.width) {
                spawnX = bounds.x - 320 - 15; // spawn on the left instead
            }
        }

        const popoutWin = new BrowserWindow({
            width: 320,
            height: 400,
            x: spawnX,
            y: spawnY,
            useContentSize: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
            autoHideMenuBar: true,
            frame: false, // Frameless for sticky note look
            transparent: true,
            backgroundColor: '#00000000',
            alwaysOnTop: isPinned, // Dynamic always on top
            icon: path.join(__dirname, '../assets/icons/icon.ico'),
            show: false // ✨ Hide initially to prevent size flashing
        });

        popoutWindows[categoryId] = popoutWin;

        popoutWin.on('closed', () => {
            delete popoutWindows[categoryId];
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('popout-closed', categoryId);
            }
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

    // ✨ Toggle always-on-top for popout windows
    ipcMain.on('set-always-on-top', (event, { categoryId, isPinned }) => {
        if (popoutWindows[categoryId]) {
            popoutWindows[categoryId].setAlwaysOnTop(isPinned);
        }
    });

    // ✨ Auto-resize popout window based on content
    ipcMain.on('resize-popout-window', (event, { categoryId, width, height }) => {
        if (popoutWindows[categoryId]) {
            const w = Math.round(width) || 350;
            const h = Math.round(height) || 450;
            popoutWindows[categoryId].setSize(w, h, true);
        }
    });

    // ✨ Show popout window after it has been resized
    ipcMain.on('show-popout-window', (event, { categoryId }) => {
        if (popoutWindows[categoryId]) {
            popoutWindows[categoryId].show();
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

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            if (!mainWindow.isVisible()) mainWindow.show();
            mainWindow.focus();
        }
    });

    app.whenReady().then(() => {
        createWindow();
        createTray();
    });
}

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

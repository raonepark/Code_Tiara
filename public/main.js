const electron = require('electron');
console.log('Electron require type:', typeof electron);
console.log('Electron require value:', electron);
console.log('Versions:', process.versions);
const { app, BrowserWindow, ipcMain, Tray, Menu, screen, session } = electron;
const path = require('path');

// ✨ Optimize startup performance (especially for frameless/transparent windows on Windows boot)
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
const http = require('http');
const fs = require('fs');

// Basic dev detection
const isDev = !app.isPackaged;

// ✨ Set App ID for Windows Notifications to show "Code Tiara"
app.setAppUserModelId("Code Tiara");

// Global reference for popout windows to prevent garbage collection
const popoutWindows = {};
const popoutPinnedStates = {};

let mainWindow = null;
let tray = null;
let isQuitting = false;

let localServerPort = null;
let localServer = null;

function startLocalServer() {
    return new Promise((resolve, reject) => {
        const tryListen = (port) => {
            localServer = http.createServer((req, res) => {
                const parsedUrl = new URL(req.url, `http://localhost`);
                let filePath = parsedUrl.pathname;
                
                if (filePath === '/') {
                    filePath = '/index.html';
                }
                
                const absolutePath = path.join(__dirname, '..', 'build', filePath);
                
                fs.access(absolutePath, fs.constants.F_OK, (err) => {
                    if (err) {
                        const indexPath = path.join(__dirname, '..', 'build', 'index.html');
                        fs.readFile(indexPath, (readErr, content) => {
                            if (readErr) {
                                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                                res.end('Not Found');
                            } else {
                                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                                res.end(content, 'utf-8');
                            }
                        });
                        return;
                    }
                    
                    fs.readFile(absolutePath, (readErr, content) => {
                        if (readErr) {
                            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                            res.end(`Internal Server Error: ${readErr.code}`);
                            return;
                        }
                        
                        const ext = path.extname(absolutePath).toLowerCase();
                        let contentType = 'text/html';
                        const mimeTypes = {
                            '.html': 'text/html',
                            '.js': 'text/javascript',
                            '.css': 'text/css',
                            '.json': 'application/json',
                            '.png': 'image/png',
                            '.jpg': 'image/jpeg',
                            '.jpeg': 'image/jpeg',
                            '.gif': 'image/gif',
                            '.svg': 'image/svg+xml',
                            '.wav': 'audio/wav',
                            '.mp4': 'video/mp4',
                            '.woff': 'font/woff',
                            '.woff2': 'font/woff2',
                            '.ttf': 'font/ttf',
                            '.eot': 'application/vnd.ms-fontobject',
                            '.otf': 'font/otf',
                            '.wasm': 'application/wasm',
                            '.ico': 'image/x-icon'
                        };
                        
                        if (mimeTypes[ext]) {
                            contentType = mimeTypes[ext];
                        }
                        
                        res.writeHead(200, { 'Content-Type': contentType });
                        res.end(content);
                    });
                });
            });
            
            localServer.listen(port, '127.0.0.1', () => {
                localServerPort = port;
                console.log(`Production local server listening on http://127.0.0.1:${localServerPort}`);
                resolve(localServerPort);
            });
            
            localServer.on('error', (err) => {
                if (err.code === 'EADDRINUSE' && port !== 0) {
                    console.warn(`Port ${port} is in use, trying next port...`);
                    tryListen(port + 1);
                } else {
                    console.error('Local server error:', err);
                    reject(err);
                }
            });
        };
        
        tryListen(51283); // Use a persistent high port (origin remains consistent)
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 320,
        height: 560,
        useContentSize: true, // This is important for precise sizing
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false // Prevent Chromium from throttling background timers when minimized/hidden
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
        : `http://127.0.0.1:${localServerPort}`;

    console.log('Loading URL:', startUrl);
    mainWindow.loadURL(startUrl);

    if (isDev) {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }

    // Set custom icon and settings for all popups (like Google Auth window)
    mainWindow.webContents.setWindowOpenHandler((details) => {
        return {
            action: 'allow',
            overrideBrowserWindowOptions: {
                icon: path.join(__dirname, '../assets/icons/icon.ico'),
                autoHideMenuBar: true
            }
        };
    });

    // Notify the renderer process if any popup (like the Google login window) is closed
    mainWindow.webContents.on('did-create-window', (childWindow, details) => {
        childWindow.on('closed', () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('auth-popup-closed');
            }
        });
    });

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
        
        // Restore always-on-top when unmaximized
        Object.keys(popoutWindows).forEach((id) => {
            const win = popoutWindows[id];
            if (win && !win.isDestroyed()) {
                const isPinned = popoutPinnedStates[id];
                if (isPinned) {
                    win.setAlwaysOnTop(true);
                }
            }
        });
    });

    mainWindow.on('focus', () => {
        if (mainWindow.isMaximized()) {
            Object.keys(popoutWindows).forEach((id) => {
                const win = popoutWindows[id];
                if (win && !win.isDestroyed()) {
                    win.setAlwaysOnTop(false);
                }
            });
        }
    });

    mainWindow.on('blur', () => {
        Object.keys(popoutWindows).forEach((id) => {
            const win = popoutWindows[id];
            if (win && !win.isDestroyed()) {
                const isPinned = popoutPinnedStates[id];
                if (isPinned) {
                    win.setAlwaysOnTop(true);
                }
            }
        });
    });

    mainWindow.on('maximize', () => {
        if (mainWindow.isFocused()) {
            Object.keys(popoutWindows).forEach((id) => {
                const win = popoutWindows[id];
                if (win && !win.isDestroyed()) {
                    win.setAlwaysOnTop(false);
                }
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

    // ✨ IPC Handlers for Cross-Window Storage Synchronization
    ipcMain.on('storage-changed', (event, data) => {
        const senderWebContents = event.sender;
        if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents !== senderWebContents) {
            mainWindow.webContents.send('storage-changed', data);
        }
        Object.values(popoutWindows).forEach((popWin) => {
            if (popWin && !popWin.isDestroyed() && popWin.webContents !== senderWebContents) {
                popWin.webContents.send('storage-changed', data);
            }
        });
    });

    ipcMain.on('storage-clear', (event) => {
        const senderWebContents = event.sender;
        if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents !== senderWebContents) {
            mainWindow.webContents.send('storage-clear');
        }
        Object.values(popoutWindows).forEach((popWin) => {
            if (popWin && !popWin.isDestroyed() && popWin.webContents !== senderWebContents) {
                popWin.webContents.send('storage-clear');
            }
        });
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

        popoutPinnedStates[categoryId] = isPinned;

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

        const shouldBeOnTop = isPinned && !(mainWindow && mainWindow.isMaximized() && mainWindow.isFocused());

        const popoutWin = new BrowserWindow({
            width: 320,
            height: 400,
            x: spawnX,
            y: spawnY,
            useContentSize: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                backgroundThrottling: false // Prevent Chromium from throttling background timers
            },
            autoHideMenuBar: true,
            frame: false, // Frameless for sticky note look
            transparent: true,
            backgroundColor: '#00000000',
            alwaysOnTop: shouldBeOnTop, // Dynamic always on top
            icon: path.join(__dirname, '../assets/icons/icon.ico'),
            show: false // ✨ Hide initially to prevent size flashing
        });

        popoutWindows[categoryId] = popoutWin;

        popoutWin.on('closed', () => {
            delete popoutWindows[categoryId];
            delete popoutPinnedStates[categoryId];
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('popout-closed', categoryId);
            }
        });

        const popoutUrl = isDev
            ? `http://localhost:3000/?popout=${categoryId}`
            : `http://127.0.0.1:${localServerPort}/?popout=${categoryId}`;

        console.log(`[Main Process] Loading URL for popout category ${categoryId}: ${popoutUrl}`);
        
        popoutWin.webContents.on('console-message', (event, level, message, line, sourceId) => {
            console.log(`[Popout Console] [Level ${level}] ${message} (${sourceId}:${line})`);
        });

        popoutWin.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
            console.error(`[Popout Load Error] Failed to load URL: ${validatedURL}. Error: ${errorDescription} (${errorCode})`);
        });

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
        console.log(`[Main Process] set-always-on-top received for categoryId: ${categoryId}, isPinned: ${isPinned}. Window exists: ${!!popoutWindows[categoryId]}`);
        popoutPinnedStates[categoryId] = isPinned;
        if (popoutWindows[categoryId]) {
            const shouldBeOnTop = isPinned && !(mainWindow && mainWindow.isMaximized() && mainWindow.isFocused());
            popoutWindows[categoryId].setAlwaysOnTop(shouldBeOnTop);
        }
    });

    // ✨ Auto-resize popout window based on content
    ipcMain.on('resize-popout-window', (event, { categoryId, width, height }) => {
        console.log(`[Main Process] resize-popout-window received for categoryId: ${categoryId}, width: ${width}, height: ${height}. Window exists: ${!!popoutWindows[categoryId]}`);
        if (popoutWindows[categoryId]) {
            const w = Math.round(width) || 350;
            const h = Math.round(height) || 450;
            popoutWindows[categoryId].setSize(w, h, true);
        }
    });

    // ✨ Show popout window after it has been resized
    ipcMain.on('show-popout-window', (event, { categoryId }) => {
        console.log(`[Main Process] show-popout-window received for categoryId: ${categoryId}. Window exists: ${!!popoutWindows[categoryId]}`);
        if (popoutWindows[categoryId]) {
            popoutWindows[categoryId].show();
        }
    });

    // ✨ Toggle launch at Windows startup
    ipcMain.on('set-auto-launch', (event, enabled) => {
        app.setLoginItemSettings({
            openAtLogin: enabled,
            path: app.getPath('exe')
        });
    });

    ipcMain.handle('get-auto-launch', () => {
        const settings = app.getLoginItemSettings();
        return settings.openAtLogin;
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
            mainWindow.show(); // Unconditionally show to ensure hidden state is bypassed
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    app.whenReady().then(async () => {
        if (session && session.defaultSession) {
            session.defaultSession.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        }
        
        if (!isDev) {
            try {
                await startLocalServer();
            } catch (err) {
                console.error('Failed to start local production server:', err);
            }
        }
        
        createWindow();
        createTray();
    });
}

app.on('window-all-closed', () => {
    if (localServer) {
        localServer.close();
    }
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

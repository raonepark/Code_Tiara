const electron = require('electron');
const { app, BrowserWindow, ipcMain, Tray, Menu, screen, session, protocol, net, shell, globalShortcut } = electron;
const path = require('path');
const { pathToFileURL } = require('url');

// ✨ Optimize startup performance (especially for frameless/transparent windows on Windows boot)
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
const fs = require('fs');

// Never let a broken stdout/stderr pipe (e.g. the terminal or parent process
// that launched us went away) turn a console.log into an "Uncaught Exception:
// write EPIPE" dialog. Logging is best-effort; the app must keep running.
for (const stream of [process.stdout, process.stderr]) {
    if (stream && typeof stream.on === 'function') {
        stream.on('error', () => {});
    }
}

// Basic dev detection.
// Set CODE_TIARA_ENV=production to exercise the packaged-app code path
// (build/ folder + http interception) from `electron .` without packaging.
const isDev = !app.isPackaged && process.env.CODE_TIARA_ENV !== 'production';
const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';

// ✨ Set App ID for Windows Notifications to show "Code Tiara"
if (isWin) {
    app.setAppUserModelId("Code Tiara");
}

// Global reference for popout windows to prevent garbage collection
const popoutWindows = {};
const popoutPinnedStates = {};

let mainWindow = null;
let tray = null;
let isQuitting = false;

// ✨ Global quick-add shortcut: from any app, Cmd/Ctrl+Shift+Space brings the
// window up and tells the renderer to open the add-task form. Enabled by
// default; the setting lives in userData so it applies before the renderer
// has loaded. Registration can fail if another app owns the combo — the
// renderer shows that state in Settings.
const QUICK_ADD_ACCELERATOR = 'CommandOrControl+Shift+Space';
const quickAddPrefsPath = () => path.join(app.getPath('userData'), 'quick-add-shortcut.json');
let quickAddEnabled = true;
let quickAddRegistered = false;

function loadQuickAddPrefs() {
    try {
        const prefs = JSON.parse(fs.readFileSync(quickAddPrefsPath(), 'utf8'));
        if (typeof prefs.enabled === 'boolean') quickAddEnabled = prefs.enabled;
    } catch (e) { /* first run: keep the default */ }
}

function saveQuickAddPrefs() {
    try { fs.writeFileSync(quickAddPrefsPath(), JSON.stringify({ enabled: quickAddEnabled })); }
    catch (e) { console.error('Failed to save quick-add shortcut setting:', e); }
}

function triggerQuickAdd() {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('quick-add');
}

function applyQuickAddShortcut() {
    globalShortcut.unregister(QUICK_ADD_ACCELERATOR);
    quickAddRegistered = false;
    if (!quickAddEnabled) return;
    try { quickAddRegistered = globalShortcut.register(QUICK_ADD_ACCELERATOR, triggerQuickAdd); }
    catch (e) { console.error('Failed to register quick-add shortcut:', e); }
    if (!quickAddRegistered) console.warn(`Quick-add shortcut ${QUICK_ADD_ACCELERATOR} is already taken by another app`);
}

const quickAddStatus = () => ({ enabled: quickAddEnabled, registered: quickAddRegistered, accelerator: QUICK_ADD_ACCELERATOR });

// ✨ Crucial for macOS: allow Cmd+Q or menu quit to properly exit
app.on('before-quit', () => {
    isQuitting = true;
});

// App icon for window headers/taskbar.
// macOS uses icon_mac.png: same artwork, but padded to Apple's template
// (artwork = 824/1024 of the canvas). Without the ~10% transparent margin the
// Dock icon renders noticeably larger than every other app's.
const appIconPath = isWin
    ? path.join(__dirname, '../assets/icons/icon.ico')
    : path.join(__dirname, '../assets/icon_mac.png');

// ✨ Production loader
// Firebase Auth (signInWithPopup) refuses to run on file:// or custom-scheme
// origins, so the packaged app must be served from an http(s) origin. Rather
// than opening a real TCP port (which could already be taken → fallback port →
// different origin → every localStorage/IndexedDB entry "disappears"), we
// intercept the http scheme inside Electron and answer requests for APP_HOST
// straight from the build/ folder. No socket is opened and the origin never
// changes.
const APP_HOST = '127.0.0.1:51283'; // must stay stable: localStorage/IndexedDB are keyed by origin
const APP_ORIGIN = `http://${APP_HOST}`;
const BUILD_DIR = path.join(__dirname, '..', 'build');

function registerAppProtocol() {
    protocol.handle('http', (request) => {
        const url = new URL(request.url);
        if (url.host !== APP_HOST) {
            // Not ours — let Chromium perform the request normally.
            return net.fetch(request, { bypassCustomProtocolHandlers: true });
        }

        let filePath;
        try {
            filePath = path.normalize(path.join(BUILD_DIR, decodeURIComponent(url.pathname)));
        } catch (e) {
            filePath = '';
        }
        // Stay inside build/ and fall back to index.html for SPA routes / unknown paths.
        const insideBuild = filePath.startsWith(BUILD_DIR + path.sep);
        if (!insideBuild || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
            filePath = path.join(BUILD_DIR, 'index.html');
        }
        return net.fetch(pathToFileURL(filePath).toString());
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 340,
        height: 600,
        useContentSize: true, // This is important for precise sizing
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            backgroundThrottling: false // Prevent Chromium from throttling background timers when minimized/hidden
        },
        autoHideMenuBar: true,
        frame: false, // ✨ Frameless Window
        transparent: true, // ✨ Rounded Corners Support
        backgroundColor: '#00000000', // ✨ Transparent Background
        icon: appIconPath
    });

    // Load URL
    // If we are in dev, we load localhost:3000
    // In production, we load the build file
    // We can assume if we are running from 'npm run electron:dev', we want localhost.
    // The environment variable ELECTRON_START_URL can be used if we want to be fancy,
    // but for now let's just use the isDev check or a simple env var.

    const startUrl = isDev
        ? 'http://localhost:3000'
        : APP_ORIGIN;

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
                icon: appIconPath,
                autoHideMenuBar: true,
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true
                }
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
                    win.setAlwaysOnTop(true, 'pop-up-menu');
                }
            }
        });
    });

    mainWindow.on('focus', () => {
        Object.keys(popoutWindows).forEach((id) => {
            const win = popoutWindows[id];
            if (win && !win.isDestroyed()) {
                const isPinned = popoutPinnedStates[id];
                const isTimer = id === 'timer';
                if (isTimer || isPinned) {
                    win.setAlwaysOnTop(true, 'pop-up-menu');
                } else if (mainWindow.isMaximized()) {
                    win.setAlwaysOnTop(false);
                }
            }
        });
    });

    mainWindow.on('blur', () => {
        Object.keys(popoutWindows).forEach((id) => {
            const win = popoutWindows[id];
            if (win && !win.isDestroyed()) {
                const isPinned = popoutPinnedStates[id];
                if (isPinned) {
                    win.setAlwaysOnTop(true, 'pop-up-menu');
                }
            }
        });
    });

    mainWindow.on('maximize', () => {
        Object.keys(popoutWindows).forEach((id) => {
            const win = popoutWindows[id];
            if (win && !win.isDestroyed()) {
                const isPinned = popoutPinnedStates[id];
                const isTimer = id === 'timer';
                if (isTimer || isPinned) {
                    win.setAlwaysOnTop(true, 'pop-up-menu');
                } else if (mainWindow.isFocused()) {
                    win.setAlwaysOnTop(false);
                }
            }
        });
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

        const isTimer = categoryId === 'timer';
        const shouldBeOnTop = isPinned && (isTimer || !(mainWindow && mainWindow.isMaximized() && mainWindow.isFocused()));

        const popoutWin = new BrowserWindow({
            width: 320,
            height: 400,
            x: spawnX,
            y: spawnY,
            useContentSize: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: false,
                contextIsolation: true,
                backgroundThrottling: false // Prevent Chromium from throttling background timers
            },
            autoHideMenuBar: true,
            frame: false, // Frameless for sticky note look
            transparent: true,
            backgroundColor: '#00000000',
            alwaysOnTop: shouldBeOnTop, // Dynamic always on top
            icon: appIconPath,
            show: false // ✨ Hide initially to prevent size flashing
        });

        popoutWindows[categoryId] = popoutWin;

        if (isMac) {
            popoutWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
        }

        popoutWin.on('closed', () => {
            delete popoutWindows[categoryId];
            delete popoutPinnedStates[categoryId];
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('popout-closed', categoryId);
            }
        });

        const popoutUrl = isDev
            ? `http://localhost:3000/?popout=${categoryId}`
            : `${APP_ORIGIN}/?popout=${categoryId}`;

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
             const isTimer = categoryId === 'timer';
             const shouldBeOnTop = isPinned && (isTimer || !(mainWindow && mainWindow.isMaximized() && mainWindow.isFocused()));
             if (shouldBeOnTop) {
                 popoutWindows[categoryId].setAlwaysOnTop(true, 'pop-up-menu');
             } else {
                 popoutWindows[categoryId].setAlwaysOnTop(false);
             }
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
            // Re-enforce always-on-top state after showing, to prevent OS z-order losses
            const isPinned = popoutPinnedStates[categoryId];
            const isTimer = categoryId === 'timer';
            const shouldBeOnTop = isPinned && (isTimer || !(mainWindow && mainWindow.isMaximized() && mainWindow.isFocused()));
            if (shouldBeOnTop) {
                popoutWindows[categoryId].setAlwaysOnTop(true, 'pop-up-menu');
            } else {
                popoutWindows[categoryId].setAlwaysOnTop(false);
            }
            console.log(`[Main Process] Enforced alwaysOnTop: ${shouldBeOnTop} for categoryId: ${categoryId} post-show`);
        }
    });

    // ✨ Open http(s) links in the system browser (the renderer has no direct shell access)
    ipcMain.on('open-external', (event, url) => {
        if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
            shell.openExternal(url);
        }
    });

    // ✨ Global quick-add shortcut on/off (see top of file)
    ipcMain.handle('get-quick-add-shortcut', () => quickAddStatus());
    ipcMain.handle('set-quick-add-shortcut', (event, opts) => {
        quickAddEnabled = !!(opts && opts.enabled);
        saveQuickAddPrefs();
        applyQuickAddShortcut();
        return quickAddStatus();
    });

    // ✨ Toggle launch at OS startup (Windows & macOS)
    ipcMain.on('set-auto-launch', (event, enabled) => {
        const settings = { openAtLogin: enabled };
        if (isWin) {
            settings.path = app.getPath('exe');
        }
        app.setLoginItemSettings(settings);
    });

    ipcMain.handle('get-auto-launch', () => {
        const settings = app.getLoginItemSettings();
        return settings.openAtLogin;
    });
}

function createTray() {
    let trayIcon;
    if (isMac) {
        // Template image (black + alpha) generated by scripts/make-tray-icon.js.
        // Load the 1x file by path so Electron pairs it with tray_icon@2x.png on
        // Retina displays instead of upscaling a single bitmap.
        const candidates = [
            path.join(__dirname, '../assets/tray_icon.png'),
            path.join(app.getAppPath(), 'assets/tray_icon.png')
        ];
        for (const iconPath of candidates) {
            try {
                if (!fs.existsSync(iconPath)) continue;
                let nImage = electron.nativeImage.createFromPath(iconPath);
                if (nImage.isEmpty()) nImage = electron.nativeImage.createFromBuffer(fs.readFileSync(iconPath));
                if (nImage.isEmpty()) continue;
                nImage.setTemplateImage(true);
                trayIcon = nImage;
                break;
            } catch (err) {
                console.error('Failed to load tray icon at:', iconPath, err);
            }
        }
    } else {
        trayIcon = path.join(__dirname, '../assets/icons/icon.ico');
    }

    if (!trayIcon) return;

    if (tray && !tray.isDestroyed()) {
        try { tray.destroy(); } catch (e) {}
    }

    tray = new Tray(trayIcon);
    try {
        console.log('Tray created successfully! Bounds:', tray.getBounds());
    } catch (e) {
        console.log('Tray getBounds error:', e);
    }

    if (isMac) {
        tray.setIgnoreDoubleClickEvents(true);
    }

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Code Tiara 열기', click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } } },
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

// Dev builds get their own userData folder. package.json's productName makes
// `electron .` and the packaged app both call themselves "Code Tiara", so they
// shared one folder — and the single-instance lock below made the dev instance
// exit silently (code 0, no window) whenever the installed app was running.
if (isDev) {
    app.setPath('userData', path.join(app.getPath('appData'), 'Code Tiara (dev)'));
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    console.error(`Another Code Tiara instance is already running (userData: ${app.getPath('userData')}). Focusing it and exiting.`);
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
        // Set macOS Dock Icon if available
        if (isMac && app.dock) {
            const dockIconPath = path.join(__dirname, '../assets/icon_mac.png');
            if (fs.existsSync(dockIconPath)) {
                app.dock.setIcon(dockIconPath);
            }
        }

        if (session && session.defaultSession) {
            const userAgent = isMac
                ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
            session.defaultSession.setUserAgent(userAgent);
        }
        
        if (!isDev) {
            registerAppProtocol();
        }
        
        createWindow();
        createTray();
        loadQuickAddPrefs();
        applyQuickAddShortcut();
    });
}

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    } else {
        mainWindow.show();
        mainWindow.focus();
    }
});

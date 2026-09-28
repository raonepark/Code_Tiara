// Auto-update (design-system §14-2, AGENTS rule 12).
//
//   Windows  electron-updater checks GitHub Releases (raonepark/Code_Tiara, one tag per version),
//            downloads in the background and installs on quit — or right away when the user
//            presses "restart & update" in the renderer notice.
//   macOS    Squirrel.Mac only installs updates signed with an Apple Developer ID, and our builds
//            are ad-hoc signed. So we only CHECK (same latest-mac.yml) and tell the user; the
//            notice opens the release page. With a Developer ID this becomes the Windows flow by
//            flipping autoDownload/autoInstallOnAppQuit.
//   Dev      unpackaged runs never check.
//
// The renderer never talks to electron-updater directly: it reads `get-update-status`, listens to
// `update-status`, and sends `install-update` (preload allow-list).
const { app, ipcMain } = require('electron');

const CHECK_DELAY_MS = 10 * 1000;              // let the board load first
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;  // the app lives in the tray for days
const RELEASES_URL = 'https://github.com/raonepark/Code_Tiara/releases/latest';

// idle | checking | none | available (mac) | downloading (win) | downloaded (win) | error
let status = { state: 'idle' };
let listWindows = () => [];

function publish(patch) {
    status = { ...status, ...patch };
    for (const win of listWindows()) {
        if (win && !win.isDestroyed()) win.webContents.send('update-status', status);
    }
}

function setupAutoUpdate({ windows }) {
    listWindows = windows;
    ipcMain.handle('get-update-status', () => status);

    if (!app.isPackaged) return; // dev / `electron .` runs

    let autoUpdater;
    try {
        ({ autoUpdater } = require('electron-updater'));
    } catch (err) {
        console.error('[updater] electron-updater unavailable:', err.message);
        return;
    }

    const isMac = process.platform === 'darwin';
    autoUpdater.autoDownload = !isMac;
    autoUpdater.autoInstallOnAppQuit = !isMac;
    autoUpdater.logger = {
        info: (...a) => console.log('[updater]', ...a),
        warn: (...a) => console.warn('[updater]', ...a),
        error: (...a) => console.error('[updater]', ...a),
        debug: () => {}
    };
    // Test hook only: point a packaged build at a local generic feed (never set in production).
    if (process.env.CODE_TIARA_UPDATE_FEED) {
        autoUpdater.setFeedURL({ provider: 'generic', url: process.env.CODE_TIARA_UPDATE_FEED });
    }

    autoUpdater.on('checking-for-update', () => {
        if (status.state !== 'downloaded') publish({ state: 'checking' });
    });
    autoUpdater.on('update-not-available', () => {
        if (status.state !== 'downloaded') publish({ state: 'none' });
    });
    autoUpdater.on('update-available', (info) => {
        publish({ state: isMac ? 'available' : 'downloading', version: info.version, pageUrl: RELEASES_URL });
    });
    autoUpdater.on('download-progress', (p) => {
        const percent = Math.floor(p.percent || 0);
        if (percent !== status.percent) publish({ state: 'downloading', percent });
    });
    autoUpdater.on('update-downloaded', (info) => {
        publish({ state: 'downloaded', version: info.version });
    });
    autoUpdater.on('error', (err) => {
        // Offline, rate limits, a draft release… never worth bothering the user about.
        console.error('[updater]', err && err.message ? err.message : err);
        if (status.state !== 'downloaded') publish({ state: 'error' });
    });

    ipcMain.on('install-update', () => {
        if (isMac || status.state !== 'downloaded') return;
        // quitAndInstall → app.quit() → our before-quit handler sets isQuitting, so the
        // hide-on-close window handler lets the windows close. isSilent + forceRunAfter:
        // the NSIS installer runs without UI and reopens the app.
        setImmediate(() => autoUpdater.quitAndInstall(true, true));
    });

    const check = () => {
        autoUpdater.checkForUpdates().catch((err) => console.error('[updater] check failed:', err && err.message));
    };
    setTimeout(check, CHECK_DELAY_MS);
    setInterval(check, CHECK_INTERVAL_MS);
}

module.exports = { setupAutoUpdate };

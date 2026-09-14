// Preload script — the only bridge between the renderer (React app) and Electron.
// The renderer runs with contextIsolation on and nodeIntegration off, so it can
// reach the main process solely through the allow-listed API exposed here.
const { contextBridge, ipcRenderer } = require('electron');

// Renderer → main, fire-and-forget. Must match the ipcMain.on handlers in main.js.
const SEND_CHANNELS = new Set([
    'minimize-window', 'maximize-window', 'close-window',
    'storage-changed', 'storage-clear',
    'open-popout', 'close-popout', 'close-popout-by-id',
    'set-always-on-top', 'resize-popout-window', 'show-popout-window',
    'set-auto-launch', 'open-external'
]);

// Renderer → main, request/response. Must match the ipcMain.handle handlers in main.js.
const INVOKE_CHANNELS = new Set(['get-auto-launch']);

// Main → renderer pushes the renderer may subscribe to.
const RECEIVE_CHANNELS = new Set([
    'auth-popup-closed', 'storage-changed', 'storage-clear', 'popout-closed'
]);

contextBridge.exposeInMainWorld('electron', {
    platform: process.platform,

    ipcRenderer: {
        send(channel, ...args) {
            if (!SEND_CHANNELS.has(channel)) {
                console.warn(`[preload] blocked send on unknown channel "${channel}"`);
                return;
            }
            ipcRenderer.send(channel, ...args);
        },

        invoke(channel, ...args) {
            if (!INVOKE_CHANNELS.has(channel)) {
                return Promise.reject(new Error(`[preload] blocked invoke on unknown channel "${channel}"`));
            }
            return ipcRenderer.invoke(channel, ...args);
        },

        // Subscribes and returns an unsubscribe function. (Function identity does
        // not survive the context bridge, so a removeListener(channel, fn) API
        // could not reliably find the original listener — use the returned fn.)
        on(channel, listener) {
            if (!RECEIVE_CHANNELS.has(channel)) {
                console.warn(`[preload] blocked subscription to unknown channel "${channel}"`);
                return () => {};
            }
            // IpcRendererEvent can't be cloned across the bridge; hand over a plain object instead.
            const wrapped = (_event, ...args) => listener({ channel }, ...args);
            ipcRenderer.on(channel, wrapped);
            return () => ipcRenderer.removeListener(channel, wrapped);
        }
    },

    shell: {
        // Validated again in main.js before shell.openExternal is called.
        openExternal(url) {
            ipcRenderer.send('open-external', url);
        }
    }
});

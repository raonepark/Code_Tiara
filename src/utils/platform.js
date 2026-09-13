/**
 * Platform Utilities for Code Tiara
 * Safe detection for both Electron Renderer (Node integration/IPC) and Browser/Web modes
 */

export const isMac = (() => {
    if (typeof window !== 'undefined') {
        if (window.process && window.process.platform) {
            return window.process.platform === 'darwin';
        }
        if (navigator && (navigator.platform || navigator.userAgent)) {
            const platform = navigator.platform || '';
            const userAgent = navigator.userAgent || '';
            return /Mac|Macintosh|MacIntel|MacPPC|Mac68K/i.test(platform) || /Macintosh/i.test(userAgent);
        }
    }
    return false;
})();

export const isWin = (() => {
    if (typeof window !== 'undefined') {
        if (window.process && window.process.platform) {
            return window.process.platform === 'win32';
        }
        if (navigator && (navigator.platform || navigator.userAgent)) {
            const platform = navigator.platform || '';
            const userAgent = navigator.userAgent || '';
            return /Win|Win32|Win64|Windows/i.test(platform) || /Windows/i.test(userAgent);
        }
    }
    return !isMac;
})();

export const cmdOrCtrl = isMac ? '⌘' : 'Ctrl';
export const cmdOrCtrlName = isMac ? 'Cmd' : 'Ctrl';

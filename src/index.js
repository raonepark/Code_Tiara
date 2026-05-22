import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './web-vitals';
import './i18n';

// Sync localStorage across Electron windows
try {
  const hasRequire = typeof window !== 'undefined' && typeof window.require === 'function';
  const isElectron = hasRequire || (window.electron && window.electron.ipcRenderer);
  if (isElectron) {
    const ipc = hasRequire ? window.require('electron').ipcRenderer : window.electron.ipcRenderer;

    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;

    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, arguments);
      ipc.send('storage-changed', { key, newValue: String(value) });
    };

    localStorage.removeItem = function(key) {
      originalRemoveItem.apply(this, arguments);
      ipc.send('storage-changed', { key, newValue: null });
    };

    localStorage.clear = function() {
      originalClear.apply(this);
      ipc.send('storage-clear');
    };

    ipc.on('storage-changed', (event, { key, newValue }) => {
      const oldValue = localStorage.getItem(key);
      if (oldValue !== newValue) {
        if (newValue === null) {
          originalRemoveItem.call(localStorage, key);
        } else {
          originalSetItem.call(localStorage, key, newValue);
        }
        const storageEvent = new StorageEvent('storage', {
          key,
          newValue,
          oldValue,
          storageArea: localStorage,
          url: window.location.href
        });
        window.dispatchEvent(storageEvent);
      }
    });

    ipc.on('storage-clear', () => {
      originalClear.call(localStorage);
      const storageEvent = new StorageEvent('storage', {
        key: null,
        newValue: null,
        oldValue: null,
        storageArea: localStorage,
        url: window.location.href
      });
      window.dispatchEvent(storageEvent);
    });
  }
} catch (e) {
  console.error('Failed to initialize cross-window storage sync:', e);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

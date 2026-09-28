import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, RefreshCw } from 'lucide-react';

// App update notice for the board window (public/updater.js, design-system §14-2).
// Shows at most one card, and only when the user can act:
//   downloaded (Windows) → "restart & update" installs right away (it also installs on quit)
//   available  (macOS)   → opens the release page; ad-hoc builds cannot self-install
// Checking, downloading and errors stay silent. "Later" hides it for this session and version.
export default function UpdateNotice({ theme }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState(null);
  const [dismissedVersion, setDismissedVersion] = useState(null);

  useEffect(() => {
    const ipc = window.electron && window.electron.ipcRenderer;
    if (!ipc) return undefined;
    let alive = true;
    ipc.invoke('get-update-status').then((s) => { if (alive) setStatus(s); }).catch(() => {});
    const off = ipc.on('update-status', (_event, s) => setStatus(s));
    return () => { alive = false; off(); };
  }, []);

  if (!status || !status.version || status.version === dismissedVersion) return null;
  const ready = status.state === 'downloaded';
  if (!ready && status.state !== 'available') return null;

  const tokens = theme.updateNotice;
  const ipc = window.electron.ipcRenderer;
  const onPrimary = () => {
    if (ready) ipc.send('install-update');
    else ipc.send('open-external', status.pageUrl);
  };
  const Icon = ready ? RefreshCw : Download;

  return (
    <div
      role="status"
      data-update-notice={status.state}
      className={`fixed left-3 right-3 bottom-3 z-[70] p-3 text-xs ${tokens.container}`}
      style={{ WebkitAppRegion: 'no-drag' }}
    >
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${tokens.title}`} />
        <div className="flex-1 min-w-0">
          <div className={`text-sm break-keep ${tokens.title}`}>
            {t(ready ? 'app.update_ready_title' : 'app.update_available_title', { version: status.version })}
          </div>
          <div className={`mt-0.5 leading-snug break-keep ${tokens.desc}`}>
            {t(ready ? 'app.update_ready_desc' : 'app.update_available_desc')}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button type="button" className={`px-3 py-1.5 whitespace-nowrap transition-colors ${tokens.secondaryBtn}`} onClick={() => setDismissedVersion(status.version)}>
          {t('app.update_later')}
        </button>
        <button type="button" className={`px-3 py-1.5 font-bold whitespace-nowrap transition-colors ${tokens.primaryBtn}`} onClick={onPrimary}>
          {t(ready ? 'app.update_restart' : 'app.update_open_page')}
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import { Minus, X, Heart } from 'lucide-react';
import { isMac } from '../utils/platform';

const CustomTitleBar = ({ theme = 'princess' }) => {
    // Safe IPC Call wrapper
    const sendIPC = (channel) => {
        try {
            if (window.electron && window.electron.ipcRenderer) {
                window.electron.ipcRenderer.send(channel);
            } else {
                console.error('Code Tiara Error: Electron IPC is not available (preload bridge missing).');
            }
        } catch (error) {
            console.error('Code Tiara Error: Failed to send IPC message', error);
        }
    };

    if (isMac) {
        return (
            <div
                className="h-[30px] bg-[#FFF0F5] flex items-center justify-between px-3 select-none shrink-0"
                style={{ WebkitAppRegion: 'drag' }}
                onDoubleClick={() => sendIPC('maximize-window')}
            >
                {/* Left: macOS Traffic Lights (Close / Minimize) */}
                <div className="flex items-center gap-2 group" style={{ WebkitAppRegion: 'no-drag' }}>
                    {/* Close (Red) */}
                    <button
                        onClick={() => sendIPC('close-window')}
                        className="w-3 h-3 rounded-full bg-[#FF5F56] hover:bg-[#E0443E] active:bg-[#C0392B] flex items-center justify-center transition-colors text-[9px] text-[#4D0000] opacity-90 hover:opacity-100 cursor-default"
                        tabIndex={-1}
                    >
                        <X className="w-2 h-2 opacity-0 group-hover:opacity-100 stroke-[3px]" />
                    </button>
                    {/* Minimize (Yellow) */}
                    <button
                        onClick={() => sendIPC('minimize-window')}
                        className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#DEA123] active:bg-[#B78117] flex items-center justify-center transition-colors text-[9px] text-[#5C4000] opacity-90 hover:opacity-100 cursor-default"
                        tabIndex={-1}
                    >
                        <Minus className="w-2 h-2 opacity-0 group-hover:opacity-100 stroke-[3px]" />
                    </button>
                </div>

                {/* Center / Right: Branding */}
                <div className="flex items-center gap-1.5 text-[#FF6B81] font-bold text-xs" style={{ WebkitAppRegion: 'no-drag' }}>
                    <Heart className="w-3 h-3 fill-current" />
                    <span>Code Tiara</span>
                </div>
            </div>
        );
    }

    // Windows Layout (Untouched Original)
    return (
        <div
            className="h-[30px] bg-[#FFF0F5] flex items-center justify-between px-3 select-none shrink-0"
            style={{ WebkitAppRegion: 'drag' }}
            onDoubleClick={() => sendIPC('maximize-window')}
        >
            {/* Left: Branding */}
            <div className="flex items-center gap-1.5 text-[#FF6B81] font-bold text-xs" style={{ WebkitAppRegion: 'no-drag' }}>
                <Heart className="w-3 h-3 fill-current" />
                <span>Code Tiara</span>
            </div>

            {/* Right: Window Controls */}
            <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
                {/* Minimize Button */}
                <button
                    onClick={() => sendIPC('minimize-window')}
                    className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-pink-200 text-slate-500 transition-colors"
                    tabIndex={-1}
                >
                    <Minus className="w-3 h-3" />
                </button>

                {/* Close Button */}
                <button
                    onClick={() => sendIPC('close-window')}
                    className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[#FF6B81] hover:text-white text-slate-500 transition-colors"
                    tabIndex={-1}
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

export default CustomTitleBar;

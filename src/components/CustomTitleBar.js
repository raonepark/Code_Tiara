import React from 'react';
import { Minus, X, Heart } from 'lucide-react'; // Using Lucide icons for controls

const CustomTitleBar = ({ theme = 'princess' }) => {
    // Safe IPC Call wrapper
    const sendIPC = (channel) => {
        try {
            // Attempt to load electron via window.require (Node Integration)
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                ipcRenderer.send(channel);
            }
            // Fallback: Check if exposed via preload (future proofing)
            else if (window.electron && window.electron.ipcRenderer) {
                window.electron.ipcRenderer.send(channel);
            }
            else {
                console.error('Code Tiara Error: Electron IPC is not available. window.require is undefined.');
                alert('Electron IPC 연결 실패: 개발 모드에서는 window.require가 필요합니다.');
            }
        } catch (error) {
            console.error('Code Tiara Error: Failed to send IPC message', error);
            alert(`오류: ${error.message}`);
        }
    };

    return (
        <div
            className="h-[30px] bg-[#FFF0F5] flex items-center justify-between px-3 select-none shrink-0"
            style={{ WebkitAppRegion: 'drag' }} // ✨ Draggable Area
        >
            {/* Left: Branding */}
            <div className="flex items-center gap-1.5 text-[#FF6B81] font-bold text-xs" style={{ WebkitAppRegion: 'no-drag' }}> {/* Make interactive if needed, else drag is fine */}
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

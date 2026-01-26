export const THEME_CONFIG = {
    developer: {
        label: 'Developer',
        root: 'bg-[#1E1E1E] text-[#ABB2BF] !font-mono', // VS Code Dark Theme Colors
        windowBorder: '#555555', // ✨ Subtle Gray Border
        card: 'bg-[#1E1E1E] border-none', // Cleaner background
        header: { bg: 'bg-[#21252B]', text: 'text-[#61AFEF]', border: 'border-b border-[#3E3E42]' }, // Dark header with soft blue text
        accent: {
            text: 'text-[#61AFEF]',
            bg: 'bg-[#61AFEF]',
            hover: 'hover:bg-[#61AFEF]/90',
            border: 'focus:border-[#61AFEF]'
        },
        iconType: 'terminal', // default
        radius: 'rounded-none', // Square corners for strict feel
        // ✨ Category Styles (List Mode)
        category: {
            variant: 'list',
            container: 'mb-4',
            header: 'flex items-center gap-2 mb-2 px-2 py-1 border-b border-[#3E3E42]', // Terminal prompt separator
            title: 'text-sm font-bold capitalize before:content-[">_"] before:mr-2 before:text-[#61AFEF]', // Terminal prompt prefix
            taskItem: 'group flex items-center gap-3 p-3 text-sm bg-[#2D2D2D] hover:bg-[#32363D] transition-colors mb-1 border-l-4', // Code line style: Opaque BG, Left Border
            actionButton: {
                wrapper: 'flex items-center gap-1',
                button: 'p-1 rounded-[4px] bg-transparent border border-[#3E4451] text-[#ABB2BF] hover:bg-[#3E4451] hover:text-white transition-colors cursor-pointer',
                icon: 'w-4 h-4'
            }
        },
        // ✨ Detailed Polish Props
        settings: {
            bg: 'bg-[#282C34]',
            wrapper: 'rounded border border-[#3E3E42] bg-[#21252B] p-4 text-[#ABB2BF] font-mono', // Added text color and font-mono
            header: 'border-b border-[#3E3E42] pb-2 mb-3 text-[#61AFEF] font-bold uppercase text-xs tracking-wider flex items-center gap-2 before:content-["#"]',
            input: 'bg-[#1E1E1E] border border-[#3E3E42] text-[#ABB2BF] focus:outline-none focus:border-[#61AFEF] placeholder-[#5C6370] rounded-none px-3 py-2 text-sm', // Updated BG to #1E1E1E
            sectionTitle: 'text-[#E06C75] text-xs font-bold uppercase tracking-wider',
            button: { default: 'bg-[#404E67] border border-[#3E3E42] hover:bg-[#4B5E7B] text-white rounded-none px-4 py-2 text-xs font-bold transition-colors' }, // Backup buttons Dark Blue
            listRow: {
                wrapper: 'flex items-center gap-2 p-2 rounded-none bg-[#282C34] border border-[#181A1F] mb-1', // Updated Border
                iconTrigger: 'bg-[#1E1E1E] rounded-none border border-[#3E3E42] text-[#ABB2BF] text-lg hover:border-[#61AFEF]', // Updated icon trigger bg
                input: 'bg-[#1E1E1E] border-none text-[#ABB2BF] focus:ring-0', // Updated Input bg to #1E1E1E
                colorTrigger: 'rounded-none border border-[#3E3E42]',
                deleteBtn: 'text-[#5C6370] bg-[#1E1E1E] border border-[#3E3E42] rounded-none hover:text-[#E06C75] hover:border-[#E06C75]'
            },
            popover: 'bg-[#21252B] border border-[#3E3E42] text-[#ABB2BF] shadow-xl font-mono'
        },
        scrollbar: {
            track: '#1E1E1E',
            thumb: '#4B5263',
            thumbHover: '#5C6370'
        },
        timer: {
            overlay: 'bg-[#1E1E1E]/95',
            title: 'text-[#5C6370]',
            text: 'text-[#98C379]',
            button: 'bg-[#2C313A] border-[#3E3E42] text-[#ABB2BF] hover:bg-[#3E4451] rounded-none'
        },
        notification: {
            container: 'bg-[#21252B] border border-[#3E3E42] text-[#ABB2BF] shadow-xl rounded-none font-mono',
            header: 'border-b border-[#3E3E42] bg-[#21252B] text-[#ABB2BF]',
            title: 'text-sm font-bold text-[#61AFEF]',
            message: 'text-xs text-[#ABB2BF] font-mono',
            time: 'text-[10px] text-[#5C6370]',
            clearBtn: 'text-[#ABB2BF] hover:text-white hover:bg-[#3E3E42]',
            closeBtn: 'text-[#ABB2BF] hover:text-[#E06C75]'
        }
    },
    princess: {
        label: 'Princess',
        root: 'bg-[#FFFCFD] text-slate-800 font-gamja font-bold text-[1.05rem]', // ✨ Gamja Flower Font (via Class)
        windowBorder: '#FFC0CB', // ✨ Pink Border
        card: 'w-full h-full bg-[#FFFCFD] p-0 relative flex flex-col', // ✨ Full Screen Ultra Light Pink Diary
        header: { bg: 'bg-[#FFF0F5]', text: 'text-[#FF6B81]', border: 'border-b border-[#FFC0CB]/30 border-dashed' },
        progress: 'bg-[#FFC0CB]', // ✨ Pastel Pink Progress Bar
        accent: {
            text: 'text-[#F472B6]', // Pink 400
            bg: 'bg-[#F472B6]',
            hover: 'hover:bg-[#F472B6]/90',
            border: 'focus:border-[#F472B6]'
        },
        iconType: 'crown',
        radius: 'rounded-2xl',
        // ✨ Category Styles (Mobile App Mode)
        category: {
            variant: 'card',
            container: 'w-full mb-4 bg-white border-[2px] rounded-[20px] overflow-hidden shadow-sm', // ✨ Added w-full
            header: 'flex items-center gap-2 p-3 border-b-2 border-dashed border-inherit bg-white', // ✨ White Header
            title: 'text-lg font-bold truncate',
            // title: 'text-lg font-bold truncate', // Duplicate removal
            taskItem: 'group flex items-center gap-3 p-3 mb-2 bg-white border border-[var(--border-idle)] rounded-[16px] hover:border-[var(--border-hover)] transition-colors shadow-sm mx-3 first:mt-3 last:mb-0'
        },
        // ✨ Detailed Polish Props (Princess)
        settings: {
            bg: 'bg-white',
            wrapper: 'w-full bg-white border-2 border-[#FFC0CB] rounded-[24px] shadow-sm p-3', // ✨ Added w-full
            header: 'p-3 text-[#FF6B81] font-bold text-lg mb-4 tracking-widest',
            input: 'bg-white border-[1.5px] border-[#FFC0CB] rounded-[30px] px-3 py-2 text-center text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B81] placeholder-[#FBCFE8]',
            sectionTitle: 'text-[#F472B6]',
            button: { default: 'bg-[#F472B6] text-white hover:bg-[#F472B6]/90 rounded-[24px] shadow-sm border-0' },
            listRow: {
                wrapper: 'flex items-center gap-2 p-2 rounded-[20px] bg-[#FFF0F5] border border-[#FFC0CB]',
                iconTrigger: 'bg-white rounded-full border border-[#FFC0CB] text-lg shadow-sm hover:scale-110 pt-1',
                input: 'bg-white border border-[#FFC0CB] rounded-[15px] focus:ring-[#FF6B81]',
                colorTrigger: 'rounded-full border-2 border-white shadow-sm',
                deleteBtn: 'text-[#FF6B81] bg-[#FFF0F5] border border-[#FFC0CB] rounded-full hover:bg-[#FF6B81] hover:text-white'
            },
            popover: 'bg-white border border-[#FFC0CB] rounded-[15px] shadow-xl'
        },
        scrollbar: {
            track: 'rgba(255, 252, 253, 0)', // Transparent Track
            thumb: '#FFB6C1', // Light Pink
            thumbHover: '#FF69B4' // Hot Pink
        },
        timer: {
            overlay: 'bg-[#FDF2F8]/95 backdrop-blur-sm',
            title: 'text-[#F9A8D4]',
            text: 'text-[#F472B6]',
            button: 'bg-white border-[#FBCFE8] text-slate-500 hover:text-[#F472B6] hover:border-[#F472B6]'
        },
        notification: {
            container: 'bg-white border-2 border-[#FFC0CB] rounded-[20px] shadow-[0_10px_30px_rgba(255,182,193,0.4)] font-gamja',
            header: 'bg-[#FFF0F5] border-b border-[#FFC0CB] border-dashed text-[#FF6B81]',
            title: 'text-base font-bold text-slate-700',
            message: 'text-sm text-slate-500',
            time: 'text-xs text-[#F472B6]',
            clearBtn: 'text-red-400 hover:text-red-500 hover:bg-red-50',
            closeBtn: 'text-slate-300 hover:text-red-400'
        }
    },
    excel: {
        label: 'Excel',
        root: 'bg-white text-[#000000] font-[Segoe_UI,Roboto,Helvetica,Arial,sans-serif]', // ✨ Force Deep Black Text
        windowBorder: '#D1D5DB', // ✨ Added Light Gray Border
        card: 'w-full h-full bg-white border border-[#D1D5DB] rounded-none shadow-none flex flex-col',
        header: {
            bg: 'bg-[#217346]',
            text: 'text-white', // Consistent white text
            border: 'border-b border-[#1e6b41]'
        },
        progress: 'bg-[#107C41]',
        accent: {
            text: 'text-[#107C41]',
            bg: 'bg-[#107C41]',
            hover: 'hover:bg-[#107C41]/90',
            border: 'focus:border-[#107C41]'
        },
        iconType: 'table',
        radius: 'rounded-none',
        category: {
            variant: 'list',
            container: 'mb-0',
            header: 'flex items-center gap-2 mb-0 px-2 py-1 bg-[#F3F2F1] border-b border-[#E1E1E1] text-[#217346] font-bold text-xs uppercase tracking-wider', // ✨ Restored Header
            title: 'text-sm font-bold text-[#333333]', // Darker title
            taskItem: 'group flex items-center gap-3 p-1 pl-2 text-[13px] bg-white hover:bg-[#F3F2F1] border-b border-[#E1E1E1] text-[#333333]', // Darker task text
            actionButton: {
                wrapper: 'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
                button: 'p-1 text-[#444] hover:text-black hover:bg-[#E1E1E1] rounded-none',
                icon: 'w-3.5 h-3.5'
            }
        },
        settings: {
            bg: 'bg-white',
            wrapper: 'rounded-none border border-[#D1D5DB] bg-white p-4 text-[#333]', // Dark text
            header: 'border-b border-[#E1E1E1] pb-2 mb-3 text-[#217346] font-bold text-sm flex items-center gap-2',
            input: 'bg-white border border-[#D1D5DB] text-[#000] focus:border-[#217346] placeholder-[#666] rounded-none px-2 py-1', // Darker placeholder/input text
            sectionTitle: 'text-[#217346] font-bold text-xs uppercase',
            button: { default: 'bg-[#F3F2F1] border border-[#D1D5DB] text-[#333] hover:bg-[#E1E1E1] rounded-none px-3 py-1 text-xs' },
            listRow: {
                wrapper: 'flex items-center gap-2 p-1 border-b border-[#E1E1E1] bg-white',
                iconTrigger: 'text-[#444] hover:text-black border border-transparent hover:border-[#D1D5DB]',
                input: 'bg-transparent border-none text-[#000] focus:ring-0',
                colorTrigger: 'rounded-none border border-[#D1D5DB]',
                deleteBtn: 'text-[#666] hover:text-red-600'
            },
            popup: "bg-white border border-[#D1D1D1] text-slate-800 shadow-xl rounded-none font-sans z-[9999]",
            popover: 'bg-white border border-[#D1D5DB] text-[#333] shadow-md rounded-none'
        },
        scrollbar: {
            track: '#E5E7EB',
            thumb: '#9CA3AF',
            thumbHover: '#107C41'
        },
        timer: {
            overlay: 'bg-white/95',
            title: 'text-slate-500',
            text: 'text-[#217346]',
            button: 'bg-white border-[#D1D5DB] text-slate-700 hover:border-[#107C41] rounded-none'
        },
        notification: {
            container: 'bg-white border border-[#217346] shadow-xl rounded-none font-sans',
            header: 'bg-[#F3F2F1] border-b border-[#E1E1E1] text-[#217346] font-bold',
            title: 'text-sm font-bold text-[#107C41]',
            message: 'text-xs text-[#333333]',
            time: 'text-[10px] text-[#666666]',
            clearBtn: 'text-[#444] hover:text-red-600 hover:bg-[#E1E1E1]',
            closeBtn: 'text-[#999] hover:text-red-600'
        }
    }
};

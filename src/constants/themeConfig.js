export const THEME_CONFIG = {
    developer: {
        label: 'Developer',
        titleText: 'text-[#61AFEF]',
        themeIcon: '💻',
        themeBadge: 'bg-[#282C34] text-[#61AFEF] border border-[#3E3E42] !rounded-none',
        themeSelectorActive: 'bg-[#3E4451] border-2 border-[#61AFEF] text-white rounded-none shadow-lg scale-105',
        themeSelectorInactive: 'bg-[#282C34] border border-[#3E4451] text-[#ABB2BF] hover:border-[#61AFEF] rounded-none shadow-sm',
        divider: 'border-slate-700/50',
        root: 'bg-[#1E1E1E] text-[#ABB2BF] !font-mono',
        windowBorder: '#555555',
        card: 'bg-[#1E1E1E] border-none',
        header: { bg: 'bg-[#21252B]', text: 'text-[#61AFEF]', border: 'border-b border-[#3E3E42]' },
        progress: 'bg-[#61AFEF]',
        accent: {
            text: 'text-[#61AFEF]',
            bg: 'bg-[#61AFEF]',
            hover: 'hover:bg-[#61AFEF]/90',
            border: 'focus:border-[#61AFEF]'
        },
        iconType: 'terminal',
        radius: 'rounded-none',
        category: {
            variant: 'list',
            container: 'mb-4',
            header: 'flex items-center gap-2 mb-2 px-2 py-1 border-b border-[#3E3E42]',
            title: 'text-sm font-bold capitalize before:content-[">_"] before:mr-2 before:text-[#61AFEF]',
            taskItem: 'group flex items-center gap-3 p-3 text-sm bg-[#2D2D2D] hover:bg-[#32363D] transition-colors mb-1 border-l-4',
            actionButton: {
                wrapper: 'flex items-center gap-1',
                button: 'p-1 rounded-[4px] bg-transparent border border-[#3E4451] text-[#ABB2BF] hover:bg-[#3E4451] hover:text-white transition-colors cursor-pointer',
                icon: 'w-4 h-4'
            }
        },
        settings: {
            bg: 'bg-[#282C34]',
            wrapper: 'rounded border border-[#3E3E42] bg-[#21252B] p-4 text-[#ABB2BF] font-mono',
            header: 'border-b border-[#3E3E42] pb-2 mb-3 text-[#61AFEF] font-bold uppercase text-xs tracking-wider flex items-center gap-2 before:content-["#"]',
            input: 'bg-[#1E1E1E] border border-[#3E3E42] text-[#ABB2BF] focus:outline-none focus:border-[#61AFEF] placeholder-[#5C6370] rounded-none px-3 py-2 text-sm',
            sectionTitle: 'text-[#E06C75] text-xs font-bold uppercase tracking-wider',
            button: { default: 'bg-[#404E67] border border-[#3E3E42] hover:bg-[#4B5E7B] text-white rounded-none px-4 py-2 text-xs font-bold transition-colors' },
            listRow: {
                wrapper: 'flex items-center gap-2 p-2 rounded-none bg-[#282C34] border border-[#181A1F] mb-1',
                iconTrigger: 'bg-[#1E1E1E] rounded-none border border-[#3E3E42] text-[#ABB2BF] text-lg hover:border-[#61AFEF]',
                input: 'bg-[#1E1E1E] border-none text-[#ABB2BF] focus:ring-0',
                colorTrigger: 'rounded-none border border-[#3E3E42]',
                deleteBtn: 'text-[#5C6370] bg-[#1E1E1E] border border-[#3E3E42] rounded-none hover:text-[#E06C75] hover:border-[#E06C75]'
            },
            popup: "bg-[#21252B] border border-[#3E3E42] rounded-none shadow-xl font-mono",
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
        },
        dropdown: {
            trigger: "bg-[#282C34] border border-[#3E3E42] rounded-none shadow-none text-[#ABB2BF] font-mono hover:border-[#61AFEF]",
            icon: "text-[#61AFEF]",
            popup: "bg-[#21252B] border border-[#3E3E42] rounded-none shadow-xl font-mono",
            itemActive: "bg-[#61AFEF] text-white font-bold",
            itemInactive: "text-[#ABB2BF] hover:bg-[#2C313A]"
        },
        datePicker: {
            popup: "bg-[#21252B] border border-[#3E4451] text-[#ABB2BF] shadow-xl rounded-none font-mono z-[100]",
            header: "bg-[#282C34] text-[#61AFEF] border-b border-[#3E4451] rounded-none",
            arrow: "text-[#5C6370] hover:bg-[#282C34] hover:text-[#ABB2BF]",
            dayDefault: "text-[#ABB2BF] hover:bg-[#282C34] rounded-none",
            daySelected: "bg-[#61AFEF] text-white font-bold hover:bg-[#528BFF] shadow-sm rounded-none",
            dayToday: "border border-[#61AFEF] text-[#61AFEF] rounded-none",
            footerBtn: "text-[#61AFEF] hover:text-[#528BFF]",
            input: "bg-[#1E1E1E] border border-[#3E4451] text-[#ABB2BF] rounded-none focus:border-[#61AFEF]"
        },
        task: {
            dragShadow: 'bg-slate-800 ring-1 ring-indigo-500/50',
            checkbox: 'text-slate-600 group-hover:text-indigo-400',
            checkboxDone: 'text-green-500',
            textDefault: 'text-slate-300',
            textDone: 'text-slate-500',
            timeDefault: 'text-slate-500',
            editContainer: 'bg-[#252526] border border-[#007ACC] shadow-2xl p-4 rounded mb-4 font-mono',
            editInputBgWrapper: '',
            editInputBg: 'text-sm text-[#D4D4D4] bg-[#3C3C3C] p-2 border border-[#3E3E42] focus:border-[#007ACC]',
            editActionRow: 'mt-2',
            editDateWrapper: '',
            editDateInput: 'w-24 text-xs bg-[#1E1E1E] text-[#CE9178] border-none',
            editTimeInput: 'text-[#D19A66] text-xs',
            editTimeSeparator: 'text-slate-400',
            editAmpmBtn: 'text-[#569CD6] text-xs',
            editCancelBtn: 'w-full sm:w-auto px-3 py-1 text-[#ABB2BF] hover:bg-[#3E3E42] text-xs rounded',
            editSaveBtn: 'w-full sm:w-auto px-3 py-1 bg-[#007ACC] text-white text-xs rounded hover:bg-[#0062A3]',
            deleteConfirmBtn: "p-1.5 text-white bg-[#FF6B81] hover:bg-[#FF4757] rounded-none shadow-lg",
            deleteCancelBtn: "p-1.5 text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 rounded-none shadow-lg"
        },
        buttons: {
            closeBtn: 'bg-transparent hover:bg-[#E06C75]/10 text-[#5C6370] hover:text-[#E06C75] border border-transparent hover:border-[#E06C75] rounded-none font-mono',
            saveBtn: 'bg-transparent hover:bg-[#98C379] text-[#98C379] hover:text-[#282C34] border border-[#98C379] rounded-none font-mono',
            dangerBtn: 'bg-transparent border border-[#E06C75] text-[#E06C75] rounded-none hover:bg-[#E06C75] hover:text-[#282C34] font-mono',
            outlineBtn: 'bg-transparent border border-[#61AFEF] text-[#61AFEF] rounded-none hover:bg-[#61AFEF]/10 font-mono',
            modalClose: 'p-1 text-[#5C6370] hover:text-white',
            modalConfirm: 'bg-[#404E67] border border-[#3E3E42] text-[#ABB2BF] hover:bg-[#E06C75] hover:text-[#282C34] hover:border-[#E06C75]',
            modalCancel: 'bg-[#282C34] border border-[#3E3E42] text-[#ABB2BF] hover:bg-[#3E3E42] hover:text-white rounded-none',
            iconBtn: 'text-[#ABB2BF] hover:text-white',
        },
        modal: {
            overlay: 'bg-[#1E1E1E]/90',
            container: 'bg-[#21252B] border border-[#3E3E42] text-[#ABB2BF] rounded-none shadow-2xl font-mono'
        }
    },
    princess: {
        label: 'Princess',
        titleText: 'text-[#FF6B81] font-[Gaegu]',
        themeIcon: '👑',
        themeBadge: 'bg-pink-100 text-pink-500',
        themeSelectorActive: 'bg-[#FFF0F5] border-2 border-[#F472B6] text-[#F472B6] rounded-xl shadow-sm scale-105',
        themeSelectorInactive: 'bg-white border border-[#FFC0CB] text-[#FF6B81] hover:border-[#F472B6] hover:bg-[#FFF0F5]/50 rounded-xl shadow-sm',
        divider: 'border-dashed border-[#FFC0CB]',
        root: 'bg-[#FFFCFD] text-slate-800 font-gamja font-bold text-[1.05rem]',
        windowBorder: '#FFC0CB',
        card: 'w-full h-full bg-[#FFFCFD] p-0 relative flex flex-col',
        header: { bg: 'bg-[#FFF0F5]', text: 'text-[#FF6B81]', border: 'border-b border-[#FFC0CB]/30 border-dashed' },
        progress: 'bg-[#FFC0CB]',
        accent: {
            text: 'text-[#F472B6]',
            bg: 'bg-[#F472B6]',
            hover: 'hover:bg-[#F472B6]/90',
            border: 'focus:border-[#F472B6]'
        },
        iconType: 'crown',
        radius: 'rounded-2xl',
        category: {
            variant: 'card',
            container: 'w-full mb-4 bg-white border-[2px] rounded-[20px] overflow-hidden shadow-sm',
            header: 'flex items-center gap-2 p-3 border-b-2 border-dashed border-inherit bg-white',
            title: 'text-lg font-bold truncate',
            taskItem: 'group flex items-center gap-3 p-3 mb-2 bg-white border border-[var(--border-idle)] rounded-[16px] hover:border-[var(--border-hover)] transition-colors shadow-sm mx-3 first:mt-3 last:mb-0',
            actionButton: {
                wrapper: 'gap-2',
                button: 'p-1.5 text-[var(--icon-color)] hover:text-white bg-[var(--c-bg)] hover:bg-[var(--icon-color)] hover:border-[var(--icon-color)] rounded-[10px] backdrop-blur-md border border-[var(--c-light)] shadow-sm transition-all duration-200 ease-in-out',
                icon: 'w-3 h-3'
            }
        },
        settings: {
            bg: 'bg-[#FFF5F8]',
            wrapper: 'w-full bg-[#FFF5F8] border-2 border-[#FFD1DC] rounded-[24px] shadow-sm p-4 relative',
            header: 'p-1 text-[#FF6B81] font-bold text-lg mb-3 flex items-center gap-2',
            input: 'w-full bg-white border-2 border-[#FFE4E1] rounded-[20px] px-4 py-2.5 text-center text-[#FF6B81] font-bold focus:outline-none focus:border-[#FFB6C1] focus:ring-4 focus:ring-[#FFF0F5] transition-all placeholder-[#FFC0CB]/60 shadow-inner',
            sectionTitle: 'text-[#FF8DA1] text-sm mb-2 flex items-center gap-1 font-bold',
            button: { default: 'bg-gradient-to-r from-[#FF9A9E] to-[#FECFEF] text-white hover:shadow-[0_4px_15px_rgba(255,182,193,0.5)] hover:-translate-y-0.5 rounded-[20px] shadow-sm font-bold border-0 transition-all px-4 py-2' },
            listRow: {
                wrapper: 'flex items-center gap-2 p-2.5 mb-2 rounded-[16px] bg-white border border-[#FFE4E1] shadow-sm hover:shadow-md transition-shadow',
                iconTrigger: 'bg-[#FFF0F5] rounded-full border border-[#FFD1DC] text-lg shadow-sm hover:scale-110 flex items-center justify-center text-[#FF6B81]',
                input: 'bg-transparent border-none focus:ring-0 text-[#FF6B81] font-bold placeholder-[#FFC0CB]',
                colorTrigger: 'rounded-full border-[3px] border-white shadow-md',
                deleteBtn: 'text-[#FFB6C1] bg-transparent hover:bg-[#FFF0F5] rounded-full hover:text-[#FF6B81] p-1.5'
            },
            popup: "bg-white border-2 border-[#FFD1DC] rounded-[20px] shadow-xl p-2",
            popover: 'bg-white border-2 border-[#FFD1DC] rounded-[20px] shadow-xl p-2'
        },
        scrollbar: {
            track: 'rgba(255, 252, 253, 0)',
            thumb: '#FFB6C1',
            thumbHover: '#FF69B4'
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
        },
        dropdown: {
            trigger: "bg-white border-2 border-[#FFC0CB] rounded-[20px] shadow-sm text-slate-600 focus:ring-2 focus:ring-[#FF6B81] hover:border-[#FF6B81] px-3",
            icon: "text-[#FF6B81]",
            popup: "bg-white border-2 border-[#FFC0CB] rounded-[20px] shadow-[0_10px_30px_rgba(255,192,203,0.3)] p-1",
            itemActive: "bg-[#FFF0F5] text-[#FF6B81] font-bold rounded-[12px]",
            itemInactive: "text-slate-600 hover:bg-[#FFF0F5] rounded-[12px] transition-colors"
        },
        datePicker: {
            popup: "bg-white border-2 border-[#FFC0CB] text-slate-600 shadow-[0_4px_20px_rgba(255,192,203,0.4)] rounded-[16px] p-2",
            header: "bg-[#FFF0F5] text-[#FF6B81] border-b border-[#FFC0CB] border-dashed rounded-[12px]",
            arrow: "text-[#FF6B81] hover:bg-white hover:text-[#F472B6]",
            dayDefault: "text-slate-600 hover:bg-[#FFF0F5] rounded-[8px]",
            daySelected: "bg-[#FF6B81] text-white font-bold hover:bg-[#F472B6] shadow-sm rounded-[8px]",
            dayToday: "border border-[#FF6B81] text-[#FF6B81] rounded-[8px]",
            footerBtn: "text-[#F472B6] hover:text-[#FF6B81] font-bold font-[Gaegu]",
            input: "bg-white border border-[#FFC0CB] text-[#FF6B81] rounded-[8px]"
        },
        task: {
            dragShadow: 'border-[#F472B6] scale-105 shadow-xl',
            checkbox: 'text-[var(--icon-color)] opacity-60 hover:opacity-100',
            checkboxDone: 'text-[var(--border-hover)]',
            textDefault: 'text-slate-600 font-medium',
            textDone: 'text-slate-600 font-medium opacity-50 line-through',
            timeDefault: 'text-slate-500 font-medium',
            editContainer: 'bg-gradient-to-br from-[var(--c-bg)] to-white p-2 sm:p-3 rounded-[16px] border-[1.5px] border-[var(--c-light)] shadow-sm mb-2 mt-1',
            editInputBgWrapper: '',
            editInputBg: 'text-sm text-slate-700 font-bold bg-white border border-[var(--c-light)] focus:border-[var(--c-dark)] focus:ring-2 focus:ring-[var(--c-bg)] rounded-[12px] px-3 py-2',
            editActionRow: 'mt-2',
            editDateWrapper: 'bg-white border border-[var(--c-light)] px-1.5 sm:px-2 py-1 rounded-[12px] shadow-sm',
            editDateInput: 'text-[var(--c-dark)] font-bold text-[10px] sm:text-xs min-w-[60px] sm:min-w-[70px] placeholder-slate-400',
            editTimeInput: 'text-[var(--c-dark)] font-bold text-[10px] sm:text-xs bg-[var(--c-bg)] border border-[var(--c-light)] rounded-[6px] focus:bg-white text-center',
            editTimeSeparator: 'text-[var(--c-dark)] text-[10px] sm:text-xs font-bold px-0.5',
            editAmpmBtn: 'px-1.5 py-0.5 rounded-[6px] bg-[var(--c-dark)] text-white text-[8px] sm:text-[9px] font-bold shadow-sm',
            editCancelBtn: 'h-8 sm:w-7 sm:h-7 rounded-[10px] bg-white text-[var(--c-dark)] border border-[var(--c-light)] hover:bg-[var(--c-bg)] text-xs font-bold shadow-sm',
            editSaveBtn: 'h-8 sm:w-7 sm:h-7 rounded-[12px] bg-[var(--c-dark)] text-white hover:-translate-y-0.5 opacity-90 hover:opacity-100 shadow-[0_4px_10px_var(--c-bg)] text-xs font-bold transition-all',
            deleteConfirmBtn: "p-1.5 text-white bg-[#FF6B81] hover:bg-[#FF4757] rounded-lg shadow-lg",
            deleteCancelBtn: "p-1.5 text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-lg"
        },
        buttons: {
            closeBtn: 'bg-slate-100 text-slate-400 hover:bg-slate-200 rounded-full border border-slate-200',
            saveBtn: 'bg-[#F472B6] hover:bg-[#F472B6]/90 text-white border border-[#F472B6] rounded-full',
            dangerBtn: 'bg-[#FFF0F5] border border-[#FFC0CB] text-[#FF6B81] rounded-2xl hover:bg-[#FF6B81] hover:text-white shadow-sm',
            outlineBtn: 'bg-[#FFF0F5] border border-[#FFC0CB] text-[#FF6B81] rounded-2xl hover:bg-[#FF6B81] hover:text-white shadow-sm',
            modalClose: 'p-1 text-slate-400 hover:bg-slate-100 rounded-full',
            modalConfirm: 'bg-[#FFF0F5] border border-[#FFC0CB] text-[#FF6B81] hover:bg-[#FF6B81] hover:text-white rounded-[16px]',
            modalCancel: 'bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-[16px]',
            iconBtn: 'text-slate-400 hover:text-[#F472B6]',
        },
        modal: {
            overlay: 'bg-white/80 backdrop-blur-sm',
            container: 'bg-white border-[3px] border-[#FFC0CB] rounded-[30px] shadow-[0_10px_40px_rgba(255,192,203,0.5)] font-[Gaegu]'
        }
    },
    excel: {
        label: 'Excel',
        titleText: 'text-[#217346]',
        themeIcon: '📊',
        themeBadge: 'bg-slate-100 text-slate-500',
        themeSelectorActive: 'bg-[#E6F2EA] border-2 border-[#107C41] text-[#107C41] rounded-none shadow-sm scale-105',
        themeSelectorInactive: 'bg-white border border-[#D1D5DB] text-[#217346] hover:border-[#107C41] hover:bg-[#F3F2F1] rounded-none shadow-sm',
        divider: 'border-[#E1E1E1]',
        root: 'bg-white text-[#000000] font-[Segoe_UI,Roboto,Helvetica,Arial,sans-serif]',
        windowBorder: '#0E6032',
        card: 'w-full h-full bg-white border-none rounded-none shadow-none flex flex-col',
        header: {
            bg: 'bg-[#217346]',
            text: 'text-white',
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
            header: 'flex items-center gap-2 mb-0 px-2 py-1 bg-[#F3F2F1] border-b border-[#E1E1E1] text-[#217346] font-bold text-xs uppercase tracking-wider',
            title: 'text-sm font-bold text-[#333333]',
            taskItem: 'group flex items-center gap-3 p-1 pl-2 text-[13px] bg-white hover:bg-[#F3F2F1] border-b border-[#E1E1E1] text-[#333333]',
            actionButton: {
                wrapper: 'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
                button: 'p-1 text-[#444] hover:text-black hover:bg-[#E1E1E1] rounded-none',
                icon: 'w-3.5 h-3.5'
            }
        },
        settings: {
            bg: 'bg-white',
            wrapper: 'rounded-none border border-[#D1D5DB] bg-white p-4 text-[#333]',
            header: 'border-b border-[#E1E1E1] pb-2 mb-3 text-[#217346] font-bold text-sm flex items-center gap-2',
            input: 'bg-white border border-[#D1D5DB] text-[#000] focus:border-[#217346] placeholder-[#666] rounded-none px-2 py-1',
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
        },
        dropdown: {
            trigger: "bg-white border border-[#D1D5DB] rounded-none shadow-none text-slate-800 hover:border-[#107C41] focus:border-[#107C41]",
            icon: "text-[#107C41]",
            popup: "bg-white border border-[#107C41] rounded-none shadow-xl",
            itemActive: "bg-[#107C41] text-white font-bold",
            itemInactive: "text-slate-800 hover:bg-[#E6F2EA]"
        },
        datePicker: {
            popup: "bg-white border border-[#D1D1D1] text-slate-800 shadow-xl rounded-none font-sans z-[9999]",
            header: "bg-[#E6F2EA] text-[#217346] border-b border-[#D1D1D1] rounded-none",
            arrow: "text-[#217346] hover:bg-white hover:text-green-700",
            dayDefault: "text-slate-700 hover:bg-[#E6F2EA] rounded-none",
            daySelected: "bg-[#217346] text-white font-bold hover:bg-[#1E6B40] shadow-sm rounded-none",
            dayToday: "border border-[#217346] text-[#217346] rounded-none",
            footerBtn: "text-[#217346] hover:text-green-700 font-bold",
            input: "bg-white border border-[#828790] text-slate-800 rounded-none focus:border-[#217346]"
        },
        task: {
            dragShadow: 'bg-white shadow-xl ring-1 ring-[#D1D1D1]',
            checkbox: '',
            checkboxDone: '',
            textDefault: 'text-[#000]',
            textDone: 'text-[#555] line-through',
            timeDefault: 'text-slate-500',
            editContainer: 'bg-white border border-[#217346] shadow-md p-0 mb-4',
            editInputBgWrapper: 'bg-[#F3F2F1] p-2',
            editInputBg: 'text-sm font-sans text-slate-800 bg-white border border-[#D1D1D1] px-3 py-2 focus:border-[#217346]',
            editActionRow: 'bg-[#F3F2F1] border-t border-[#D1D1D1] p-2 mt-0',
            editDateWrapper: '',
            editDateInput: 'w-24 text-xs p-1 bg-white border border-[#D1D1D1]',
            editTimeInput: 'bg-white border border-[#D1D1D1] h-6 text-xs',
            editTimeSeparator: 'text-slate-400',
            editAmpmBtn: 'px-1 bg-white border border-[#D1D1D1] text-[10px] h-6',
            editCancelBtn: 'w-full sm:w-auto px-4 py-1 bg-white border border-[#D1D1D1] hover:bg-slate-100 text-xs text-slate-700',
            editSaveBtn: 'w-full sm:w-auto px-4 py-1 bg-[#107C41] text-white border border-[#107C41] hover:bg-[#0E6032] text-xs font-bold',
            deleteConfirmBtn: "p-1 text-white bg-[#C00000] hover:bg-[#900000] rounded-none",
            deleteCancelBtn: "p-1 text-[#333] bg-white border border-[#D1D1D1] hover:bg-[#E1E1E1] rounded-none"
        },
        buttons: {
            closeBtn: 'bg-white hover:bg-[#F3F2F1] text-slate-600 rounded-none border border-[#D1D1D1]',
            saveBtn: 'bg-[#217346] hover:bg-[#1E6B3B] text-white rounded-none border border-[#1E6B3B]',
            dangerBtn: 'bg-white border border-[#C00000] text-[#C00000] rounded-none hover:bg-[#C00000] hover:text-white',
            outlineBtn: 'bg-[#F3F2F1] border border-[#D1D5DB] text-[#217346] rounded-none hover:bg-[#E1E1E1] hover:text-[#107C41]',
            modalClose: 'p-1 text-[#666] hover:text-black hover:bg-[#F3F2F1]',
            modalConfirm: 'bg-[#C00000] border border-[#C00000] text-white hover:bg-[#900000] rounded-none',
            modalCancel: 'bg-white text-[#333] border border-[#D1D1D1] hover:bg-[#E1E1E1] rounded-none',
            iconBtn: 'text-[#444] hover:text-black',
        },
        modal: {
            overlay: 'bg-black/50 backdrop-blur-sm',
            container: 'bg-white border border-[#D1D1D1] rounded-none shadow-xl'
        }
    }
};

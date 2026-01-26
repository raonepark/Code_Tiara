import React, { useState, useEffect, useRef } from 'react';
import {
  Trash2, Plus, CheckCircle2, Circle, Zap, Code, BookOpen, Laptop,
  Terminal, Command, Settings, X, Save, RotateCcw, AlertTriangle,
  Download, Upload, Timer, Pause, Play, ChevronUp, ChevronDown, Clock, Bell,
  Star, Coffee, Music, Home, Briefcase, Heart, Sun, Moon, Hourglass,
  PanelTopClose, PanelTopOpen, Edit2, Check, Grid2X2, Calendar, Minus, GripVertical, Menu, Gift
} from 'lucide-react';
import CustomDatePicker from './components/CustomDatePicker';
import TaskItem from './components/TaskItem';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CATEGORY_HUES, CATEGORY_ICON_HUES, hexToRgba } from './constants';

// ✨ Constants imported from constants.js

const StyledDropdown = ({ value, onChange, options, placeholder, currentTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.id === value)?.label || placeholder || "Select";

  // 🎨 Theme Styles
  const getThemeStyles = () => {
    switch (currentTheme) {
      case 'princess':
        return {
          trigger: "bg-white border-2 border-[#FFC0CB] rounded-[20px] shadow-sm text-slate-600 focus:ring-2 focus:ring-[#FF6B81] hover:border-[#FF6B81] px-3",
          icon: "text-[#FF6B81]",
          popup: "bg-white border-2 border-[#FFC0CB] rounded-[20px] shadow-[0_10px_30px_rgba(255,192,203,0.3)] p-1",
          itemActive: "bg-[#FFF0F5] text-[#FF6B81] font-bold rounded-[12px]",
          itemInactive: "text-slate-600 hover:bg-[#FFF0F5] rounded-[12px] transition-colors"
        };
      case 'excel':
        return {
          trigger: "bg-white border border-[#D1D5DB] rounded-none shadow-none text-slate-800 hover:border-[#107C41] focus:border-[#107C41]",
          icon: "text-[#107C41]",
          popup: "bg-white border border-[#107C41] rounded-none shadow-xl",
          itemActive: "bg-[#107C41] text-white font-bold",
          itemInactive: "text-slate-800 hover:bg-[#E6F2EA]"
        };
      case 'developer':
        return {
          trigger: "bg-[#282C34] border border-[#3E3E42] rounded-none shadow-none text-[#ABB2BF] font-mono hover:border-[#61AFEF]",
          icon: "text-[#61AFEF]",
          popup: "bg-[#21252B] border border-[#3E3E42] rounded-none shadow-xl font-mono",
          itemActive: "bg-[#61AFEF] text-white font-bold",
          itemInactive: "text-[#ABB2BF] hover:bg-[#2C313A]"
        };
      default:
        return {
          trigger: "bg-white border border-slate-200 rounded text-slate-600",
          icon: "text-slate-400",
          popup: "bg-white border border-slate-200 rounded shadow-lg",
          itemActive: "bg-slate-100 font-bold",
          itemInactive: "hover:bg-slate-50"
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className={`relative w-1/3 min-w-[100px] ${currentTheme === 'developer' ? 'font-mono' : ''}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2 pl-3 text-sm focus:outline-none transition-all ${styles.trigger}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${styles.icon}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 mt-1 w-full z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${styles.popup}`}>
          <div className="max-h-48 overflow-y-auto custom-scrollbar p-1">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm mb-0.5 transition-colors ${currentTheme === 'excel' || currentTheme === 'developer' ? 'rounded-none' : 'rounded-[10px]'} ${value === opt.id
                  ? styles.itemActive
                  : styles.itemInactive
                  }`}
              >
                {opt.label}
              </button>
            ))}
            {options.length === 0 && <div className="p-2 text-center text-xs opacity-50">없음</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const LumoraDashboard = () => {




  // --- 초기 데이터 정의 (공용 템플릿용 - 한글화) ---
  const defaultCategories = [
    { id: 'cat_1', label: '중요', colorTheme: 'red', icon: 'star' },
    { id: 'cat_2', label: '업무', colorTheme: 'cyan', icon: 'briefcase' },
    { id: 'cat_3', label: '개인', colorTheme: 'emerald', icon: 'coffee' },
  ];

  const defaultTasks = [
    { id: 1, text: '문서 업데이트', categoryId: 'cat_2', completed: false, dueTime: '', alerted: false },
    { id: 2, text: '저녁 장보기', categoryId: 'cat_3', completed: false, dueTime: '18:00', alerted: false },
    { id: 3, text: '주간 목표 계획', categoryId: 'cat_1', completed: false, dueTime: '', alerted: false },
  ];

  const defaultTitle = 'My Board';

  // --- State 관리 ---
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('lumora_categories');
      return saved ? JSON.parse(saved) : defaultCategories;
    } catch (e) { return defaultCategories; }
  });

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('lumora_tasks');
      return saved ? JSON.parse(saved) : defaultTasks;
    } catch (e) { return defaultTasks; }
  });

  const [projectTitle, setProjectTitle] = useState(() => {
    return localStorage.getItem('lumora_title') || defaultTitle;
  });

  // --- 🍅 타이머 설정 State (저장 가능) ---
  const [focusDuration, setFocusDuration] = useState(() => {
    return parseInt(localStorage.getItem('lumora_focus_duration')) || 25;
  });
  const [breakDuration, setBreakDuration] = useState(() => {
    return parseInt(localStorage.getItem('lumora_break_duration')) || 5;
  });
  const prevDurationsRef = useRef({ focus: focusDuration, break: breakDuration });

  // --- 🔠 폰트 크기 State ---
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('lumora_font_size') || 'small';
  });

  // --- 🎨 테마 설정 State ---
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('lumora_theme') || 'developer';
  });

  // --- 🧊 Modal States ---
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // --- 🪄 Drag & Drop Logic (Categories) ---
  const onDragEndCategories = (result) => {
    if (!result.destination) return;
    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setCategories(items);
    localStorage.setItem('lumora_categories', JSON.stringify(items));
  };

  // --- 🎨 THEME CONFIGURATION ---
  const THEME_CONFIG = {
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
        title: 'text-lg font-bold truncate',
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
      }
    }
  };

  const theme = THEME_CONFIG[currentTheme];

  const rootClassName = `h-screen w-screen ${theme.root} flex overflow-hidden`;
  const cardClassName = `w-full h-full ${theme.card} overflow-hidden flex flex-col relative transition-all`;

  // 폰트 크기에 따른 텍스트 클래스 매핑
  const getTextSizeClass = (size) => {
    switch (size) {
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      default: return 'text-sm'; // small
    }
  };

  const getSubTextSizeClass = (size) => {
    switch (size) {
      case 'medium': return 'text-xs';
      case 'large': return 'text-sm';
      default: return 'text-[11px]'; // small (increased from 10px)
    }
  };

  // --- ✏️ 수정 모드 State ---
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [editingDate, setEditingDate] = useState(''); // ✨ 수정 모드 날짜
  const [editingHour, setEditingHour] = useState('');
  const [editingMinute, setEditingMinute] = useState('');
  const [editingAmpm, setEditingAmpm] = useState('오전');

  const [newTaskText, setNewTaskText] = useState('');
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null); // ✨ Inline Delete Confirmation State // ✨ 삭제 확인 모달 State
  const [confirmingCategoryDeleteId, setConfirmingCategoryDeleteId] = useState(null); // ✨ Inline Category Delete State
  const [taskDate, setTaskDate] = useState(''); // ✨ 새 작업 날짜
  const [taskHour, setTaskHour] = useState('');
  const [taskMinute, setTaskMinute] = useState('');
  const [taskAmpm, setTaskAmpm] = useState('오전');

  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // UI 상태 관리
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isResetConfirming, setIsResetConfirming] = useState(false);
  const fileInputRef = useRef(null);



  // --- 🔔 알림(Notification) State ---
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // --- 🍅 포모도로 타이머 State ---
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('focus');

  // --- 창 제목(Document Title) 업데이트 ---
  const [boardTitle, setBoardTitle] = useState(() => localStorage.getItem('lumora_title') || defaultTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // ✨ Mini Mode Detection (< 450px)
  const [isMiniMode, setIsMiniMode] = useState(window.innerWidth < 450);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // ✨ Menu Toggle State

  // useEffect for resize removed to allow manual control without override

  // --- 데이터 자동 저장 ---
  useEffect(() => {
    localStorage.setItem('lumora_categories', JSON.stringify(categories));
    localStorage.setItem('lumora_tasks', JSON.stringify(tasks));
    localStorage.setItem('lumora_title', projectTitle);
    localStorage.setItem('lumora_focus_duration', focusDuration);
    localStorage.setItem('lumora_break_duration', breakDuration);
    localStorage.setItem('lumora_font_size', fontSize);
    localStorage.setItem('lumora_theme', currentTheme); // ✨ 테마 저장
  }, [categories, tasks, projectTitle, focusDuration, breakDuration, fontSize, currentTheme]);

  // --- 🔔 시스템 알림 권한 요청 ---
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !categories.find(c => c.id === selectedCategoryId)) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // 설정 변경 시 타이머 리셋 반영
  useEffect(() => {
    const prev = prevDurationsRef.current;
    const durationsChanged = prev.focus !== focusDuration || prev.break !== breakDuration;

    if (!isTimerRunning && durationsChanged) {
      setTimeLeft(timerMode === 'focus' ? focusDuration * 60 : breakDuration * 60);
    }
    prevDurationsRef.current = { focus: focusDuration, break: breakDuration };
  }, [focusDuration, breakDuration, isTimerRunning, timerMode]);

  // --- ⏰ 시간 변환 헬퍼 함수 ---
  const convertTo24Hour = (h, m, ampm) => {
    if (!h || !m) return '';
    let hour = parseInt(h, 10);
    if (ampm === '오후' && hour < 12) hour += 12;
    if (ampm === '오전' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const formatTimeDisplay = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? '오후' : '오전';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${ampm} ${String(hour).padStart(2, '0')}:${m}`;
  };

  // --- ⏰ 알람 체크 로직 ---
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      // ✨ 날짜 체크: YYYY-MM-DD 형식
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      const tasksToAlert = tasks.filter(t =>
        t.dueTime === currentTimeStr &&
        (!t.dueDate || t.dueDate === todayStr) && // ✨ 날짜가 없거나 오늘 날짜일 때만
        !t.completed &&
        !t.alerted
      );

      if (tasksToAlert.length > 0) {
        const newNotifs = tasksToAlert.map(t => ({
          id: Date.now() + Math.random(),
          title: '알림',
          message: `"${t.text}" 마감 시간!`,
          time: formatTimeDisplay(currentTimeStr),
          read: false,
          taskId: t.id // ✨ Link notification to task
        }));
        setNotifications(prev => [...newNotifs, ...prev]);

        // 시스템 알림 발생
        tasksToAlert.forEach(t => {
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('Lumora Dashboard', {
              body: `"${t.text}" 마감 시간입니다!`,
              silent: false
            });
          }
        });

        setTasks(prevTasks => prevTasks.map(t =>
          tasksToAlert.find(alertTask => alertTask.id === t.id)
            ? { ...t, alerted: true }
            : t
        ));
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [tasks]);


  // --- 타이머 로직 ---
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // 타이머 종료 시 알림
      const title = timerMode === 'focus' ? '집중 시간 끝!' : '휴식 시간 끝!';
      const msg = timerMode === 'focus' ? '수고했어! 이제 좀 쉬자.' : '자, 다시 집중해볼까?';
      setNotifications(prev => [{
        id: Date.now(),
        title,
        message: msg,
        time: formatTimeDisplay(`${new Date().getHours()}:${new Date().getMinutes()}`),
        read: false
      }, ...prev]);

      // 타이머 종료 시스템 알림
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('Lumora Dashboard', {
          body: msg,
          silent: false
        });
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, timerMode]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(timerMode === 'focus' ? focusDuration * 60 : breakDuration * 60);
  };

  const switchTimerMode = () => {
    const newMode = timerMode === 'focus' ? 'break' : 'focus';
    setTimerMode(newMode);
    setTimeLeft(newMode === 'focus' ? focusDuration * 60 : breakDuration * 60);
    setIsTimerRunning(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- 계산 로직 ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // --- Actions: Tasks ---
  const addTask = (e, forcedCatId = null) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    if (categories.length === 0) return;

    const finalDueTime = convertTo24Hour(taskHour, taskMinute, taskAmpm);

    const newTask = {
      id: Date.now(),
      text: newTaskText,
      categoryId: forcedCatId || selectedCategoryId,
      completed: false,
      dueDate: taskDate, // ✨ 날짜 저장
      dueTime: finalDueTime,
      alerted: false
    };
    setTasks([...tasks, newTask]);
    setNewTaskText('');
    setTaskDate(''); // ✨ 초기화
    setTaskHour('');
    setTaskMinute('');
    setTaskAmpm('오전');

    // ✨ Close the quick add form if it was open
    if (forcedCatId) {
      setMiniModeAdderId(null);
    }
  };

  const clearCompletedTasks = () => {
    const newTasks = tasks.filter(t => !t.completed);
    setTasks(newTasks);
    localStorage.setItem('lumora_tasks', JSON.stringify(newTasks));
    setIsMenuOpen(false);
    setIsClearConfirmOpen(false); // Close modal after delete
  };

  const deleteTask = (id) => {
    setTaskToDelete(id); // 모달 띄우기
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      setTasks(prev => prev.filter(t => t.id !== taskToDelete));
      setTaskToDelete(null);
    }
  };

  // ✨ Inline Delete Helper
  const finalDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setConfirmingDeleteId(null);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // --- Actions: Edit Task ---
  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
    setEditingDate(task.dueDate || ''); // ✨ 날짜 로드
    if (task.dueTime) {
      // 24시간제 -> 12시간제 변환
      let [h, m] = task.dueTime.split(':');
      h = parseInt(h);
      const ampm = h >= 12 ? '오후' : '오전';
      h = h % 12;
      h = h ? h : 12;
      setEditingHour(String(h));
      setEditingMinute(m);
      setEditingAmpm(ampm);
    } else {
      setEditingHour('');
      setEditingMinute('');
      setEditingAmpm('오전');
    }
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingText('');
    setEditingDate(''); // ✨ 초기화
    setEditingHour('');
    setEditingMinute('');
    setEditingAmpm('오전');
  };

  const saveEditing = (id) => {
    if (!editingText.trim()) return;

    // 시간 저장 로직
    const finalDueTime = convertTo24Hour(editingHour, editingMinute, editingAmpm);

    setTasks(tasks.map(t => t.id === id ? {
      ...t,
      text: editingText,
      dueDate: editingDate, // ✨ 날짜 저장
      dueTime: finalDueTime,
      alerted: false // 시간 수정 시 알림 리셋
    } : t));

    cancelEditing();
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    // 드롭한 곳이 없으면 리턴
    if (!destination) return;

    // 같은 자리에 드롭하면 리턴
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    // 같은 카테고리 내 이동
    if (source.droppableId === destination.droppableId) {
      const categoryId = source.droppableId;
      const categoryTasks = tasks.filter(t => t.categoryId === categoryId);

      // 전체 tasks 복사
      const currentTasks = [...tasks];

      // 카테고리별로 분리해서 재정렬 후 다시 합치는 게 안전함.
      let allLists = [];
      categories.forEach(cat => {
        let catTasks = currentTasks.filter(t => t.categoryId === cat.id);
        if (cat.id === categoryId) {
          const [moved] = catTasks.splice(source.index, 1);
          catTasks.splice(destination.index, 0, moved);
        }
        allLists = [...allLists, ...catTasks];
      });

      setTasks(allLists);

    } else {
      // 다른 카테고리로 이동
      const sourceCatId = source.droppableId;
      const destCatId = destination.droppableId;

      const currentTasks = [...tasks];
      let sourceTasks = currentTasks.filter(t => t.categoryId === sourceCatId);
      let destTasks = currentTasks.filter(t => t.categoryId === destCatId);

      const [movedItem] = sourceTasks.splice(source.index, 1);

      // 카테고리 ID 업데이트
      const updatedItem = { ...movedItem, categoryId: destCatId };

      destTasks.splice(destination.index, 0, updatedItem);

      // 카테고리 순서대로 합치기 (화면 표시 순서 유지)
      let finalTasks = [];
      categories.forEach(cat => {
        if (cat.id === sourceCatId) finalTasks.push(...sourceTasks);
        else if (cat.id === destCatId) finalTasks.push(...destTasks);
        else finalTasks.push(...currentTasks.filter(t => t.categoryId === cat.id));
      });

      setTasks(finalTasks);
    }
  };

  // --- Actions: Categories & System ---
  const addCategory = () => {
    const colorOptions = ['red', 'cyan', 'emerald', 'yellow', 'purple'];
    const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    const newCat = {
      id: `cat_${Date.now()}`,
      label: '새 카테고리',
      colorTheme: randomColor,
      icon: 'star' // default icon
    };
    setCategories([...categories, newCat]);
  };

  const updateCategory = (id, field, value) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [activePicker, setActivePicker] = useState(null);
  const [isThemeSettingsExpanded, setIsThemeSettingsExpanded] = useState(false); // ✨ Collapsible Theme Settings
  const [miniModeAdderId, setMiniModeAdderId] = useState(null); // ✨ Quick Add State
  const miniModeFormRef = useRef(null); // ✨ Ref for Quick Add Form
  const editFormRef = useRef(null); // ✨ Ref for Edit Task Form
  const notifRef = useRef(null); // ✨ Ref for Notifications

  // ✨ Click Outside to Close Quick Add Form
  useEffect(() => {
    const handleClickOutside = (event) => {
      // ✨ Check if click is inside the DatePicker Portal
      const datePickerPopup = document.getElementById('custom-datepicker-popup');
      if (datePickerPopup && datePickerPopup.contains(event.target)) {
        return; // Ignore clicks inside the date picker
      }

      if (miniModeAdderId && miniModeFormRef.current && !miniModeFormRef.current.contains(event.target)) {
        if (!event.target.closest(`button[data-trigger-id="${miniModeAdderId}"]`)) {
          setMiniModeAdderId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [miniModeAdderId]);

  // ✨ Click Outside for Notifications
  useEffect(() => {
    const handleClickOutsideNotif = (e) => {
      if (isNotifOpen && notifRef.current && !notifRef.current.contains(e.target) && !e.target.closest('button[title="알림"]')) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideNotif);
    return () => document.removeEventListener('mousedown', handleClickOutsideNotif);
  }, [isNotifOpen]);

  // ✨ Click Outside to Close Delete Confirmation
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // Check for Task Delete Confirmation
      if (taskToDelete) {
        const confirmContainer = document.querySelector(`[data-delete-type="task"]`);
        if (confirmContainer && !confirmContainer.contains(e.target)) {
          setTaskToDelete(null);
        }
      }
      // Check for Category Delete Confirmation
      else if (categoryToDelete) {
        const confirmContainer = document.querySelector(`[data-delete-type="category"]`);
        if (confirmContainer && !confirmContainer.contains(e.target)) {
          setCategoryToDelete(null);
        }
      }
      // Check for Inline Delete (Icon Buttons)
      else if (confirmingDeleteId) {
        const confirmContainer = document.querySelector(`[data-delete-confirm-id="${confirmingDeleteId}"]`);
        if (confirmContainer && !confirmContainer.contains(e.target)) {
          setConfirmingDeleteId(null);
        }
      }
      else if (confirmingCategoryDeleteId) {
        const confirmContainer = document.querySelector(`[data-cat-delete-confirm-id="${confirmingCategoryDeleteId}"]`);
        if (confirmContainer && !confirmContainer.contains(e.target)) {
          setConfirmingCategoryDeleteId(null);
        }
      }
      // ✨ Check for Edit Task Form (Click Outside to Cancel)
      else if (editingTaskId) {
        // ✨ Check if click is inside the DatePicker Portal
        const datePickerPopup = document.getElementById('custom-datepicker-popup');
        if (datePickerPopup && datePickerPopup.contains(e.target)) {
          return; // Ignore clicks inside the date picker
        }

        if (editFormRef.current && !editFormRef.current.contains(e.target)) {
          cancelEditing();
        }
      }
    };

    if (taskToDelete || categoryToDelete || confirmingDeleteId || confirmingCategoryDeleteId || editingTaskId) {
      document.addEventListener('mousedown', handleGlobalClick);
    }
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, [taskToDelete, categoryToDelete, confirmingDeleteId, confirmingCategoryDeleteId, editingTaskId]);




  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    setCategories(categories.filter(c => c.id !== categoryToDelete));
    setTasks(tasks.filter(t => t.categoryId !== categoryToDelete));
    setCategoryToDelete(null);
  };

  // ✨ Inline Category Delete Helper
  const finalDeleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setTasks(prev => prev.filter(t => t.categoryId !== id));
    setConfirmingCategoryDeleteId(null);
  };

  const moveCategoryUp = (index) => {
    if (index === 0) return;
    const newCategories = [...categories];
    [newCategories[index - 1], newCategories[index]] = [newCategories[index], newCategories[index - 1]];
    setCategories(newCategories);
  };

  const moveCategoryDown = (index) => {
    if (index === categories.length - 1) return;
    const newCategories = [...categories];
    [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
    setCategories(newCategories);
  };

  // --- Actions: Notifications ---
  const clearNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };
  const clearAllNotifications = () => {
    setNotifications([]);
    setIsNotifOpen(false);
  };
  const unreadCount = notifications.length;

  // --- 💾 백업 & 복구 ---
  const exportData = () => {
    const data = {
      title: projectTitle,
      categories,
      tasks,
      settings: { focus: focusDuration, break: breakDuration },
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const triggerImport = () => { fileInputRef.current?.click(); };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.categories && data.tasks) {
          if (window.confirm('현재 데이터를 덮어쓰고 불러오시겠습니까? (되돌릴 수 없습니다)')) {
            setProjectTitle(data.title || defaultTitle);
            setCategories(data.categories);
            setTasks(data.tasks);
            if (data.settings) {
              setFocusDuration(data.settings.focus || 25);
              setBreakDuration(data.settings.break || 5);
            }
            setIsSettingsOpen(false);
            alert('복구 완료!');
          }
        } else { alert('잘못된 파일입니다.'); }
      } catch (err) { alert('오류 발생'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetRequest = () => {
    if (isResetConfirming) {
      setCategories(defaultCategories);
      setTasks(defaultTasks);
      setProjectTitle(defaultTitle);
      setFocusDuration(25);
      setBreakDuration(5);
      localStorage.clear();
      setIsSettingsOpen(false);
      setIsResetConfirming(false);
    } else {
      setIsResetConfirming(true);
      setTimeout(() => setIsResetConfirming(false), 3000);
    }
  };

  // --- Styling Helpers ---
  const getThemeStyles = (color) => {
    // ✨ Normalize Color Inputs (Handle Aliases)
    let normalizedColor = color;
    if (color === 'princess') normalizedColor = 'red';
    else if (color === 'blue') normalizedColor = 'cyan';
    else if (color === 'mint' || color === 'green') normalizedColor = 'emerald';

    // 🎀 Princess Theme Palette (Pastel w/ White Text Compatibility or Dark Text)
    if (currentTheme === 'princess') {
      switch (normalizedColor) {
        case 'red': return { border: 'border-[#FBCFE8]', bg: 'bg-[#FFF0F5]', text: 'text-[#EC4899]', icon: 'text-[#F472B6] drop-shadow-sm', progress: 'bg-[#FFC0CB] shadow-[0_0_10px_rgba(244,114,182,0.4)]' }; // Strawberry (Updated Progress)
        case 'cyan': return { border: 'border-[#BAE6FD]', bg: 'bg-[#F0F9FF]', text: 'text-[#0EA5E9]', icon: 'text-[#38BDF8] drop-shadow-sm', progress: 'bg-[#38BDF8] shadow-[0_0_10px_rgba(56,189,248,0.4)]' }; // Sky
        case 'emerald': return { border: 'border-[#A7F3D0]', bg: 'bg-[#ECFDF5]', text: 'text-[#10B981]', icon: 'text-[#34D399] drop-shadow-sm', progress: 'bg-[#34D399] shadow-[0_0_10px_rgba(52,211,153,0.4)]' }; // Mint
        case 'yellow': return { border: 'border-[#FDE68A]', bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]', icon: 'text-[#FBBF24] drop-shadow-sm', progress: 'bg-[#FBBF24] shadow-[0_0_10px_rgba(251,191,36,0.4)]' }; // Cream
        case 'purple': return { border: 'border-[#E9D5FF]', bg: 'bg-[#FAF5FF]', text: 'text-[#8B5CF6]', icon: 'text-[#A78BFA] drop-shadow-sm', progress: 'bg-[#A78BFA] shadow-[0_0_10px_rgba(167,139,250,0.4)]' }; // Lavender
        default: return { border: 'border-slate-200', bg: 'bg-white', text: 'text-slate-500', icon: 'text-slate-400', progress: 'bg-slate-300' };
      }
    }
    // Default / Developer / Excel
    // Default / Developer / Excel (VS Code Palette)
    switch (normalizedColor) {
      case 'red': return { border: 'border-l-[#E06C75]', bg: '', text: 'text-[#E06C75]', icon: 'text-[#E06C75]', progress: 'bg-[#E06C75]' }; // Soft Red
      case 'cyan': return { border: 'border-l-[#61AFEF]', bg: '', text: 'text-[#61AFEF]', icon: 'text-[#61AFEF]', progress: 'bg-[#61AFEF]' }; // Soft Blue
      case 'emerald': return { border: 'border-l-[#98C379]', bg: '', text: 'text-[#98C379]', icon: 'text-[#98C379]', progress: 'bg-[#98C379]' }; // Soft Green
      case 'yellow': return { border: 'border-l-[#E5C07B]', bg: '', text: 'text-[#E5C07B]', icon: 'text-[#E5C07B]', progress: 'bg-[#E5C07B]' }; // Soft Gold
      case 'purple': return { border: 'border-l-[#C678DD]', bg: '', text: 'text-[#C678DD]', icon: 'text-[#C678DD]', progress: 'bg-[#C678DD]' }; // Soft Purple
      default: return { border: 'border-l-[#5C6370]', bg: '', text: 'text-[#5C6370]', icon: 'text-[#5C6370]', progress: 'bg-[#5C6370]' }; // Comment Gray
    }
  };

  const getOverallProgressColor = () => {
    if (progressPercentage < 30) return getThemeStyles('red').progress;
    if (progressPercentage < 70) return getThemeStyles('yellow').progress;
    return getThemeStyles('emerald').progress;
  };

  // ✨ 아이콘 맵퍼 (테마별 아이콘 변경)
  const getIcon = (iconName, className) => {
    // 🎀 Princess Theme Special Icons
    if (currentTheme === 'princess') {
      switch (iconName) {
        case 'crown': return <div className="text-sm">👑</div>;
        case 'heart': return <div className="text-sm">🎀</div>;
        case 'star': return <div className="text-sm">⭐</div>;
        case 'coffee': return <div className="text-sm">☕</div>;
        case 'music': return <div className="text-sm">🎵</div>;
        case 'home': return <div className="text-sm">🏠</div>;
        case 'briefcase': return <div className="text-sm">💼</div>;
        case 'terminal': return <div className="text-sm">💻</div>;
        case 'table': return <div className="text-sm">📊</div>;
        case 'book': return <div className="text-sm">📚</div>;
        case 'gift': return <div className="text-sm">🎁</div>;
        case 'gift': return <div className="text-sm">🎁</div>;
        case 'zap': return <div className="text-lg">✨</div>;
        case 'code': return <div className="text-sm">📝</div>;
        case 'sun': return <div className="text-sm">☀️</div>;
        case 'moon': return <div className="text-sm">🌙</div>;
        case 'alert': return <div className="text-sm">⚠️</div>;
        case 'hourglass': return <div className="text-sm">⏳</div>;
        case 'calendar': return <div className="text-sm">📅</div>;
        default: return <div className="text-sm">📌</div>;
      }
    }
    // 📊 Excel Theme Special Icons
    if (currentTheme === 'excel') {
      // Excel specific overrides if needed
    }

    // Default Icons
    switch (iconName) {
      case 'zap': return <Zap className={className} />;
      case 'code': return <Code className={className} />;
      case 'book': return <BookOpen className={className} />;
      case 'star': return <Star className={className} />;
      case 'coffee': return <Coffee className={className} />;
      case 'music': return <Music className={className} />;
      case 'home': return <Home className={className} />;
      case 'briefcase': return <Briefcase className={className} />;
      case 'heart': return <Heart className={className} />;
      case 'sun': return <Sun className={className} />;
      case 'moon': return <Moon className={className} />;
      case 'alert': return <AlertTriangle className={className} />;
      case 'hourglass': return <Hourglass className={className} />;
      case 'terminal': return <Laptop className={className} />;
      case 'table': return <Grid2X2 className={className} />;
      case 'book': return <BookOpen className={className} />;
      case 'gift': return <Gift className={className} />;
      case 'calendar': return <Calendar className={className} />;
      default: return <Terminal className={className} />;
    }
  };

  // ✨ Safe IPC Call wrapper
  const sendIPC = (channel) => {
    try {
      if (window.require) {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send(channel);
      } else if (window.electron && window.electron.ipcRenderer) {
        window.electron.ipcRenderer.send(channel);
      } else {
        console.error('Electron IPC not available');
      }
    } catch (e) { console.error('IPC Error', e); }
  };

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden transition-colors duration-500 ${theme.radius} ${theme.root} ${currentTheme === 'princess' ? 'bg-[#FFF0F5]' : (currentTheme === 'developer' ? 'bg-[#1e1e1e]' : 'bg-white')}`}
      style={{ border: `2px solid ${theme.windowBorder || 'transparent'}` }}
    >
      {/* Custom Scrollbar Styles injected here 
      */}
      <style>{`
        /* 폰트 강제 적용 클래스 */
        .font-gamja {
          font-family: 'Gamja Flower', cursive !important;
        }

        /* 스크롤바 전체 너비/높이 */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        /* 스크롤바 트랙 (배경) */
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        /* 스크롤바 핸들 (막대) */
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: ${theme.scrollbar.thumb} !important;
          border-radius: 10px !important;
        }
        /* 스크롤바 버튼 숨김 (네모 방지) */
        .custom-scrollbar::-webkit-scrollbar-button {
          display: none;
        }
        /* 스크롤바 코너 투명 */
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
        /* 스크롤바 핸들 호버 */
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme.scrollbar.thumbHover} !important;
        }
        /* Firefox 지원 */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${theme.scrollbar.thumb} transparent;
        }
      `}</style>

      {/* ✨ Custom Title Bar (Fixed at Top) */}
      {/* ✨ Custom Title Bar Removed */}

      {/* Size Change: Full Window Mode & No Limits */}
      <div className={`${cardClassName} rounded-lg h-full`}>

        {/* Terminal Header Bar */}
        <div className={`${theme.header.bg} px-3 h-10 flex items-center justify-between ${theme.header.border} border-b relative z-20 shrink-0 select-none`} style={{ WebkitAppRegion: 'drag' }}>
          <div className="flex gap-1.5" style={{ WebkitAppRegion: 'no-drag' }}>
            <button
              onClick={() => sendIPC('close-window')}
              className={`w-2.5 h-2.5 rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 transition-colors cursor-pointer flex items-center justify-center group`}
              title="닫기"
            >
              <X className="w-1.5 h-1.5 text-black/50 opacity-0 group-hover:opacity-100" />
            </button>
            <button
              onClick={() => sendIPC('minimize-window')}
              className={`w-2.5 h-2.5 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 transition-colors cursor-pointer flex items-center justify-center group`}
              title="최소화"
            >
              <Minus className="w-1.5 h-1.5 text-black/50 opacity-0 group-hover:opacity-100" />
            </button>
            <button
              onClick={() => sendIPC('maximize-window')}
              className={`w-2.5 h-2.5 rounded-full bg-[#27C93F] hover:bg-[#27C93F]/80 transition-colors cursor-pointer flex items-center justify-center group`}
              title="화면 맞춤"
            >
              <Plus className="w-1.5 h-1.5 text-black/50 opacity-0 group-hover:opacity-100" />
            </button>
          </div>
          <div className={`text-[10px] ${currentTheme === 'excel' ? 'text-white' : theme.header.text} ${isMiniMode ? 'flex' : 'hidden min-[220px]:flex'} items-center gap-1 font-bold absolute left-1/2 -translate-x-1/2`}>
            {getIcon(theme.iconType, 'w-3 h-3')}
            {/* ✨ Title (Dynamic) */}
            <span className={`truncate max-w-[150px] sm:max-w-[200px] ${currentTheme === 'princess' ? 'text-sm font-bold tracking-tight text-[#FF6B81]' : (theme.header.text + ' uppercase tracking-widest')}`}>
              {currentTheme === 'princess' ? <>나의 다이어리 <span className="text-xs">🎀</span></> : projectTitle}
            </span>
          </div>
          <div className="flex gap-1.5 items-center" style={{ WebkitAppRegion: 'no-drag' }}>
            {/* ✨ Calendar Icon (Princess) */}
            {/* ✨ Calendar Icon (Princess) - DELETED per request */}



            {/* ✨ Icons Group (Princess Only) */}
            {/* ✨ Icons Group (Princess Only) */}
            {currentTheme === 'princess' && (
              <div className={`flex items-center gap-1 text-[#FF6B81] relative`}>

                {/* Bell */}
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`p-1 rounded hover:bg-slate-700/10 transition-colors relative ${isNotifOpen || unreadCount > 0 ? theme.accent.text : ''}`}
                  title="알림"
                >
                  <Bell className="w-3 h-3" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 text-[6px] text-white font-bold animate-pulse ring-1 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Settings (Menu Trigger) */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-1 rounded hover:bg-slate-700/10 transition-colors ${isMenuOpen ? theme.accent.text : ''}`}
                  title="메뉴"
                >
                  <Settings className="w-3 h-3" />
                </button>

                {/* ✨ Dropdown Menu (Under Gear) */}
                {isMenuOpen && (
                  <>
                    {/* Backdrop to close */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>

                    {/* Menu Card */}
                    <div className="absolute right-0 top-8 w-40 bg-white border-2 border-[#FFC0CB] rounded-[15px] shadow-[0_10px_20px_rgba(255,182,193,0.3)] z-50 overflow-hidden text-slate-600 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                      {/* 🎀 Princess Arrow */}
                      <div className="absolute -top-1.5 right-2 w-3 h-3 bg-white border-t-2 border-l-2 border-[#FFC0CB] rotate-45"></div>

                      {/* Menu Items */}
                      <div className="flex flex-col py-1 relative z-10 bg-white">
                        <button
                          onClick={() => { sendIPC('toggle-mini-mode'); setIsMiniMode(!isMiniMode); setIsMenuOpen(false); }}
                          className="px-3 py-2 text-xs font-bold hover:bg-[#FFF0F5] hover:text-[#FF6B81] text-left flex items-center gap-2 transition-colors"
                        >
                          <span>{isMiniMode ? '🖥️' : '📱'}</span> {isMiniMode ? '전체 모드' : '미니 모드'}
                        </button>
                        <button
                          onClick={() => { setIsTimerOpen(!isTimerOpen); setIsMenuOpen(false); }}
                          className="px-3 py-2 text-xs font-bold hover:bg-[#FFF0F5] hover:text-[#FF6B81] text-left flex items-center gap-2 transition-colors"
                        >
                          <span>⏱️</span> 타이머
                        </button>
                        <button
                          onClick={() => { setIsClearConfirmOpen(true); setIsMenuOpen(false); }}
                          className="px-3 py-2 text-xs font-bold hover:bg-[#FFF0F5] hover:text-[#FF6B81] text-left flex items-center gap-2 transition-colors"
                        >
                          <span>🧹</span> 완료 항목 정리
                        </button>
                        <div className="h-px bg-[#FFC0CB]/30 mx-2 my-0.5"></div>
                        <button
                          onClick={() => { setIsSettingsOpen(true); setIsMenuOpen(false); }}
                          className="px-3 py-2 text-xs font-bold hover:bg-[#FFF0F5] hover:text-[#FF6B81] text-left flex items-center gap-2 transition-colors"
                        >
                          <span>🔧</span> 전체 설정
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ✨ Icons Group (Non-Princess) */}
            {/* ✨ Icons Group (Non-Princess: Developer/Excel/Default) */}
            {currentTheme !== 'princess' && (
              <div className={`flex items-center gap-1 relative ${currentTheme === 'excel' ? 'text-white' : 'text-slate-500'}`}>
                {/* Bell */}
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`p-1 rounded hover:bg-slate-700/10 transition-colors relative ${isNotifOpen || unreadCount > 0 ? (currentTheme === 'excel' ? 'bg-white/20 font-bold' : theme.accent.text) : ''}`}
                  title="알림"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 text-[6px] text-white font-bold animate-pulse ring-1 ring-slate-900">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Settings (Menu Trigger) */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-1 rounded hover:bg-slate-700/10 transition-colors ${isMenuOpen ? (currentTheme === 'excel' ? 'bg-white/20 font-bold' : theme.accent.text) : ''}`}
                  title="메뉴"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* ✨ Dropdown Menu (Under Gear) - Non-Princess */}
                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                    <div className={`absolute right-0 top-8 w-40 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200
                      ${currentTheme === 'excel'
                        ? 'bg-white border border-[#217346] rounded-none shadow-xl'
                        : theme.settings.popover
                      }`}>

                      {/* Arrow */}
                      {currentTheme === 'princess' && (
                        <div className="absolute -top-1.5 right-2 w-3 h-3 border-t border-l rotate-45 bg-white border-[#FFC0CB]"></div>
                      )}

                      <div className={`flex flex-col py-1 relative z-10 ${currentTheme === 'princess' ? 'bg-white' : ''}`}>
                        <button
                          onClick={() => { sendIPC('toggle-mini-mode'); setIsMiniMode(!isMiniMode); setIsMenuOpen(false); }}
                          className={`px-3 py-2 text-xs font-bold text-left flex items-center gap-2 transition-colors
                            ${currentTheme === 'princess'
                              ? 'text-slate-600 hover:bg-pink-50 hover:text-pink-500'
                              : (currentTheme === 'excel' ? 'text-slate-800 hover:bg-[#E6F2EA]' : 'text-inherit hover:bg-black/10')
                            }`}
                        >
                          <span className={currentTheme === 'excel' ? "opacity-100" : ""}>{isMiniMode ? '🖥️' : '📱'}</span> {isMiniMode ? '전체 모드' : '미니 모드'}
                        </button>
                        <button
                          onClick={() => { setIsTimerOpen(!isTimerOpen); setIsMenuOpen(false); }}
                          className={`px-3 py-2 text-xs font-bold text-left flex items-center gap-2 transition-colors
                            ${currentTheme === 'princess'
                              ? 'text-slate-600 hover:bg-pink-50 hover:text-pink-500'
                              : (currentTheme === 'excel' ? 'text-slate-800 hover:bg-[#E6F2EA]' : 'text-inherit hover:bg-black/10')
                            }`}
                        >
                          <span className={currentTheme === 'excel' ? "opacity-100" : ""}>⏱️</span> 타이머
                        </button>
                        <button
                          onClick={() => { setIsClearConfirmOpen(true); setIsMenuOpen(false); }}
                          className={`px-3 py-2 text-xs font-bold text-left flex items-center gap-2 transition-colors
                            ${currentTheme === 'princess'
                              ? 'text-slate-600 hover:bg-pink-50 hover:text-pink-500'
                              : (currentTheme === 'excel' ? 'text-slate-800 hover:bg-[#E6F2EA]' : 'text-inherit hover:bg-black/10')
                            }`}
                        >
                          <span className={currentTheme === 'excel' ? "opacity-100" : ""}>🧹</span> 완료 항목 정리
                        </button>
                        <div className={`h-px mx-2 my-0.5 ${currentTheme === 'princess' ? 'bg-pink-100' : (currentTheme === 'excel' ? 'bg-[#E1E1E1]' : 'bg-current opacity-10')}`}></div>
                        <button
                          onClick={() => { setIsSettingsOpen(true); setIsMenuOpen(false); }}
                          className={`px-3 py-2 text-xs font-bold text-left flex items-center gap-2 transition-colors
                            ${currentTheme === 'princess'
                              ? 'text-slate-600 hover:bg-pink-50 hover:text-pink-500'
                              : (currentTheme === 'excel' ? 'text-slate-800 hover:bg-[#E6F2EA]' : 'text-inherit hover:bg-black/10')
                            }`}
                        >
                          <span className={currentTheme === 'excel' ? "opacity-100" : ""}>🔧</span> 전체 설정
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {/* Notification Dropdown (Compact) with Custom Scrollbar */}

            {/* Notification Dropdown (Compact) with Custom Scrollbar */}
            {/* Notification Dropdown (Compact) with Custom Scrollbar */}
            {isNotifOpen && (
              <div ref={notifRef} className={`absolute shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 ${currentTheme === 'princess' ? 'bg-white border-2 border-[#FFC0CB] rounded-[20px] top-10 right-4 w-64 max-w-[calc(100vw-2rem)] shadow-[0_10px_30px_rgba(255,182,193,0.4)]' : (currentTheme === 'developer' ? `right-12 top-8 w-64 ${theme.settings.popover}` : `right-2 top-7 w-56 ${theme.settings.popover}`)}`}>
                {/* 🎀 Princess Arrow */}
                {currentTheme === 'princess' && <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white border-t-2 border-l-2 border-[#FFC0CB] rotate-45"></div>}

                <div className={`px-3 py-2.5 border-b flex justify-between items-center ${currentTheme === 'princess' ? 'bg-[#FFF0F5] border-[#FFC0CB] border-dashed' : 'border-b border-inherit bg-inherit text-inherit'}`}>
                  <span className={`text-xs font-bold opacity-70 ${currentTheme === 'princess' ? 'text-[#FF6B81]' : 'text-inherit'}`}>알림 ({unreadCount})</span>
                  {unreadCount > 0 && (
                    <button onClick={clearAllNotifications} className={`text-xs font-medium underline underline-offset-2 px-2 py-1 rounded ${currentTheme === 'princess' ? 'text-red-400 hover:text-red-500 hover:bg-red-50' : 'text-inherit opacity-70 hover:opacity-100 hover:bg-white/10'}`}>지우기</button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {unreadCount === 0 ? (
                    <p className={`p-4 text-center text-sm opacity-60 ${currentTheme === 'princess' ? 'text-[#F472B6] font-[Gaegu]' : 'text-inherit'}`}>알림이 없습니다 {currentTheme === 'princess' ? '🎀' : ''}</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-3 border-b hover:bg-black/5 flex gap-3 items-start group ${currentTheme === 'princess' ? 'border-[#FFC0CB] border-dashed bg-white' : 'border-inherit'}`}>
                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 shadow-sm ${currentTheme === 'princess' ? 'bg-red-400 ring-2 ring-red-100' : 'bg-red-500'}`}></div>
                        <div className="flex-1 space-y-1">
                          <p className={`font-bold tracking-tight ${currentTheme === 'princess' ? 'text-base text-slate-700' : (currentTheme === 'developer' ? 'text-sm text-inherit font-mono' : 'text-base text-inherit')}`}>{n.title} <span className="text-xs opacity-50 font-normal ml-1">{n.time}</span></p>
                          <p className={`leading-snug ${currentTheme === 'princess' ? 'text-sm text-slate-500' : (currentTheme === 'developer' ? 'text-xs opacity-80 font-mono leading-tight' : 'text-sm opacity-80')}`}>{n.message}</p>
                        </div>
                        <button onClick={() => clearNotification(n.id)} className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 ${currentTheme === 'princess' ? 'text-slate-300 hover:text-red-400' : 'text-inherit hover:text-red-400'}`}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>


        </div>

        {/* --- 🍅 POMODORO TIMER OVERLAY (Compact) --- */}


        {/* --- SETTINGS MODE (Compact) with Custom Scrollbar --- */}
        {isSettingsOpen ? (
          <div className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-300 flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-md mx-auto w-full space-y-4">

              {/* 🏷️ Header */}
              <div className="flex justify-between items-center mb-2">
                <h2 className={`text-xl font-bold flex items-center gap-1.5 ${currentTheme === 'princess' ? 'text-[#FF6B81] font-[Gaegu]' : (currentTheme === 'excel' ? 'text-[#217346]' : 'text-slate-100')}`}>
                  <Settings className={`w-5 h-5 ${currentTheme === 'princess' ? 'text-[#FF6B81]' : (currentTheme === 'excel' ? 'text-[#217346]' : 'text-indigo-500')}`} />
                  {currentTheme === 'princess' ? '설정' : (currentTheme === 'excel' ? '환경 설정' : 'Settings')}
                </h2>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 transition-all shadow-sm font-bold
                  ${currentTheme === 'princess'
                      ? 'bg-[#F472B6] hover:bg-[#F472B6]/90 text-white border border-[#F472B6] rounded-full'
                      : (currentTheme === 'excel'
                        ? 'bg-[#217346] hover:bg-[#1E6B3B] text-white rounded-none border border-[#1E6B3B]'
                        : (currentTheme === 'developer' ? 'bg-transparent hover:bg-[#98C379] text-[#98C379] hover:text-[#282C34] border border-[#98C379] rounded-none font-mono' : `${theme.accent.bg} ${theme.accent.hover} text-white rounded-full`)
                      )
                    }`}
                >
                  <Save className="w-3.5 h-3.5" /> 저장
                </button>
              </div>



              {/* 🎨 Theme Settings Card - Unified */}
              {/* 🎨 Theme Settings Card - Unified (Collapsible) */}
              <div className={theme.settings.wrapper}>
                <div
                  onClick={() => setIsThemeSettingsExpanded(!isThemeSettingsExpanded)}
                  className={`flex items-center justify-between cursor-pointer ${theme.settings.header.replace('mb-3', 'mb-0')}`} // Remove bottom margin if collapsed
                >
                  <div className="flex items-center gap-2">
                    <span>테마 설정</span>
                    {!isThemeSettingsExpanded && (
                      <span className={`text-[10px] font-normal px-2 py-0.5 rounded-full ${currentTheme === 'princess' ? 'bg-pink-100 text-pink-500' : 'bg-slate-100 text-slate-500'}`}>
                        {currentTheme === 'princess' ? '👑 Princess' : (currentTheme === 'excel' ? '📊 Excel' : '💻 Developer')}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isThemeSettingsExpanded ? 'rotate-180' : ''}`} />
                </div>

                {isThemeSettingsExpanded && (
                  <div className="flex gap-2 mt-3 animate-in slide-in-from-top-2 duration-200">
                    {Object.keys(THEME_CONFIG).map((key) => (
                      <button
                        key={key}
                        onClick={() => setCurrentTheme(key)}
                        className={`flex-1 flex flex-col items-center justify-center p-3 transition-all duration-300 ease-in-out
                        ${currentTheme === key
                            ? (key === 'princess' ? 'bg-[#FFF0F5] border-2 border-[#F472B6] text-[#F472B6] rounded-xl shadow-sm scale-105' :
                              key === 'excel' ? 'bg-white border-2 border-[#107C41] text-[#107C41] rounded-none shadow-sm scale-105' :
                                'bg-[#3E4451] border-2 border-[#61AFEF] text-white rounded-none shadow-lg scale-105') // Dev Active
                            : (currentTheme === 'developer' ? 'bg-[#2D2D2D] border-[#3E4451] text-[#ABB2BF] hover:bg-[#3E3E42] rounded-none' : // Dev Inactive Context (Darken all unselected buttons)
                              `bg-[#F9F9F9] border border-[#E0E0E0] text-[#888888] hover:bg-slate-100 ${key === 'princess' ? 'rounded-xl' : key === 'excel' ? 'rounded-none' : 'rounded-lg'}`)
                          } border text-[10px] sm:text-xs`}
                      >
                        <span className="text-xl mb-1">{key === 'princess' ? '👑' : key === 'excel' ? '📊' : '💻'}</span>
                        <span className="text-[10px] font-bold">{THEME_CONFIG[key].label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ⏰ Timer & Font Card - Unified */}
              <div className={theme.settings.wrapper}>
                <div className={theme.settings.header}>
                  타이머 및 글꼴
                </div>

                {/* Timer Flex */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-1">
                    <label className={`text-xs block mb-1 font-bold ml-1 ${currentTheme === 'princess' ? 'text-[#FF6B81]' : theme.timer.title}`}>집중 (분)</label>
                    <input
                      type="number"
                      value={focusDuration}
                      onChange={(e) => setFocusDuration(Number(e.target.value))}
                      className={`w-full ${theme.settings.input} transition-all`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className={`text-xs block mb-1 font-bold ml-1 ${currentTheme === 'princess' ? 'text-[#FF6B81]' : theme.timer.title}`}>휴식 (분)</label>
                    <input
                      type="number"
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(Number(e.target.value))}
                      className={`w-full ${theme.settings.input} transition-all`}
                    />
                  </div>
                </div>

                {/* Font Size */}
                <div className={`pt-3 border-t ${currentTheme === 'princess' ? 'border-dashed border-[#FFC0CB]' : 'border-slate-700/50'}`}>
                  <div className={`text-xs mb-2 font-bold ml-1 ${currentTheme === 'princess' ? 'text-[#FF6B81]' : theme.settings.sectionTitle}`}>
                    텍스트 크기
                  </div>
                  <div className={`flex p-1 ${currentTheme === 'princess' ? 'bg-slate-100/50 border border-slate-200 rounded-full' : (currentTheme === 'excel' ? 'bg-slate-100/50 border border-slate-200' : 'bg-slate-100/50 border border-slate-200 rounded-lg')}`}>
                    {['small', 'medium', 'large'].map(size => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`flex-1 py-1.5 text-xs transition-all font-bold duration-300
                          ${fontSize === size
                            ? (currentTheme === 'princess' ? 'bg-[#F472B6] text-white rounded-full shadow-sm scale-105' :
                              currentTheme === 'excel' ? 'bg-[#217346] text-white rounded-none shadow-sm scale-105' :
                                'bg-[#61AFEF] text-[#282C34] rounded-none shadow-sm scale-105') // Dev Active (Blue)
                            : 'text-slate-400 hover:text-slate-600 hover:bg-black/5 ' + (currentTheme === 'princess' ? 'rounded-full' : currentTheme === 'excel' ? 'rounded-none' : 'rounded-md')
                          }`}
                      >
                        {size === 'small' ? '작게' : size === 'medium' ? '보통' : '크게'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 💾 Data & Category Card - Unified */}
              <div className={theme.settings.wrapper}>
                <div className={theme.settings.header}>
                  데이터 백업/복구
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={exportData}
                    className={`flex flex-col items-center justify-center p-3 transition-all group ${theme.settings.button.default} hover:-translate-y-0.5`}
                  >
                    <Download className="w-5 h-5 mb-1" /> <span className="text-xs font-bold">백업</span>
                  </button>
                  <button onClick={triggerImport}
                    className={`flex flex-col items-center justify-center p-3 transition-all group ${theme.settings.button.default} hover:-translate-y-0.5`}
                  >
                    <Upload className="w-5 h-5 mb-1" /> <span className="text-xs font-bold">복구</span>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />
                </div>
              </div>

              {/* 🎨 Unified Category Management (All Themes use 'Editable Row') */}
              <div className={`p-3 border-t ${currentTheme === 'princess' ? 'border-dashed border-[#FFC0CB]' : 'border-slate-700/50'}`}>
                <div className={`text-sm mb-2 font-bold ${currentTheme === 'princess' ? 'text-[#FF6B81]' : theme.settings.sectionTitle}`}>카테고리 관리</div>
                <DragDropContext onDragEnd={onDragEndCategories}>
                  <Droppable droppableId="categories-list">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2 overflow-visible"
                      >
                        {categories.map((cat, index) => (
                          <Draggable key={cat.id} draggableId={cat.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`relative transition-colors duration-200 group ${theme.settings.listRow.wrapper} ${currentTheme === 'excel' ? (index % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F9]') : ''} ${activePicker?.id === cat.id ? 'z-50' : 'z-0'} ${snapshot.isDragging ? 'shadow-lg z-[100]' : ''} flex items-center`}
                              >
                                {/* 🖐️ Drag Handle */}
                                {currentTheme === 'excel' ? (
                                  <div {...provided.dragHandleProps} className="w-[30px] -ml-3 mr-2 self-stretch flex items-center justify-center bg-[#F3F2F1] border-r border-[#D1D1D1] text-[10px] text-slate-500 font-sans cursor-grab active:cursor-grabbing hover:bg-[#E1E1E1] transition-colors">
                                    {index + 1}
                                  </div>
                                ) : currentTheme === 'princess' ? (
                                  <div {...provided.dragHandleProps} className="mr-2 cursor-grab active:cursor-grabbing text-[#FFB6C1] hover:bg-[#FFF0F5] p-1 rounded-full transition-colors">
                                    <Menu className="w-4 h-4" />
                                  </div>
                                ) : (
                                  <div {...provided.dragHandleProps} className={`mr-2 cursor-grab active:cursor-grabbing p-1 transition-colors ${currentTheme === 'developer' ? 'text-[#5C6370] hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                )}

                                {/* 1. Icon Picker */}
                                <div className="relative">
                                  <button
                                    onClick={() => setActivePicker(activePicker?.id === cat.id && activePicker?.type === 'icon' ? null : { id: cat.id, type: 'icon' })}
                                    className={`w-8 h-8 flex items-center justify-center transition-all ${theme.settings.listRow.iconTrigger} ${activePicker?.id === cat.id && activePicker?.type === 'icon' ? 'ring-2 ring-opacity-50 scale-110' : ''}`}
                                  >
                                    {currentTheme === 'developer' || currentTheme === 'excel' ? (
                                      // 💻 Developer/Excel Theme (Standard/Outline Icons)
                                      getIcon(cat.icon, `w-4 h-4 ${activePicker?.id === cat.id ? (currentTheme === 'excel' ? 'text-[#217346]' : 'text-[#61AFEF]') : (currentTheme === 'excel' ? 'text-slate-600' : 'text-[#ABB2BF]')}`)
                                    ) : (
                                      // 🎀 Princess / Default Icons (Emoji)
                                      cat.icon === 'heart' ? '🎀' : (cat.icon === 'star' ? '⭐' : (cat.icon === 'coffee' ? '☕' : (cat.icon === 'music' ? '🎵' : (cat.icon === 'home' ? '🏠' : (cat.icon === 'briefcase' ? '💼' : (cat.icon === 'terminal' ? '💻' : (cat.icon === 'table' ? '📊' : (cat.icon === 'book' ? '📚' : (cat.icon === 'gift' ? '🎁' : (cat.icon === 'zap' ? '✨' : (cat.icon === 'code' ? '📝' : (cat.icon === 'alert' ? '⚠️' : (cat.icon === 'hourglass' ? '⏳' : (cat.icon === 'calendar' ? '📅' : '📌'))))))))))))))
                                    )}
                                  </button>
                                  {/* Icon Popover */}
                                  {activePicker?.id === cat.id && activePicker?.type === 'icon' && (
                                    <>
                                      <div className="fixed inset-0 z-[9998]" onClick={() => setActivePicker(null)}></div>
                                      <div className={`absolute left-0 top-full mt-2 flex p-1 gap-1 z-[9999] animate-in fade-in zoom-in-95 ${theme.settings.popover} flex-wrap w-[186px]`}>
                                        {['star', 'heart', 'coffee', 'music', 'home', 'briefcase', 'terminal', 'gift', 'code', 'calendar'].map(icon => (
                                          <button
                                            key={icon}
                                            onClick={() => { updateCategory(cat.id, 'icon', icon); setActivePicker(null); }}
                                            className={`w-8 h-8 flex items-center justify-center rounded-md text-xs transition-colors hover:bg-black/5 ${cat.icon === icon ? 'bg-black/5 ring-1 ring-[#61AFEF]' : ''} ${currentTheme === 'developer' ? 'text-[#ABB2BF] hover:text-white' : (currentTheme === 'excel' ? 'text-slate-700 hover:text-black' : '')}`}
                                          >
                                            {currentTheme === 'developer' || currentTheme === 'excel' ? (
                                              getIcon(icon, 'w-4 h-4') // Use standard icons in picker too
                                            ) : (
                                              icon === 'heart' ? '🎀' : (icon === 'star' ? '⭐' : (icon === 'coffee' ? '☕' : (icon === 'music' ? '🎵' : (icon === 'home' ? '🏠' : (icon === 'briefcase' ? '💼' : (icon === 'terminal' ? '💻' : (icon === 'gift' ? '🎁' : (icon === 'code' ? '📝' : (icon === 'calendar' ? '📅' : '📌')))))))))
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>

                                {/* 2. Name Input */}
                                <input
                                  type="text"
                                  value={cat.label}
                                  onChange={(e) => updateCategory(cat.id, 'label', e.target.value)}
                                  className={`flex-1 px-3 py-1.5 text-xs transition-all outline-none min-w-0 ${theme.settings.listRow.input}`}
                                />

                                {/* 3. Color Picker */}
                                <div className="relative flex items-center justify-center h-6">
                                  <button
                                    onClick={() => setActivePicker(activePicker?.id === cat.id && activePicker?.type === 'color' ? null : { id: cat.id, type: 'color' })}
                                    className={`w-6 h-6 transition-all hover:scale-110 ${theme.settings.listRow.colorTrigger} ${activePicker?.id === cat.id && activePicker?.type === 'color' ? 'ring-2 ring-opacity-50 scale-110' : ''} ${(cat.colorTheme === 'princess' || cat.colorTheme === 'red') ? 'bg-[#FFC0CB]' :
                                      (cat.colorTheme === 'blue' || cat.colorTheme === 'cyan') ? 'bg-[#AEE4FF]' :
                                        (cat.colorTheme === 'mint' || cat.colorTheme === 'emerald' || cat.colorTheme === 'green') ? 'bg-[#98FB98]' :
                                          (cat.colorTheme === 'purple') ? 'bg-[#DDA0DD]' :
                                            (cat.colorTheme === 'yellow') ? 'bg-[#FFB347]' : 'bg-slate-400'
                                      }`}
                                  />
                                  {/* Color Popover */}
                                  {activePicker?.id === cat.id && activePicker?.type === 'color' && (
                                    <>
                                      <div className="fixed inset-0 z-[9998]" onClick={() => setActivePicker(null)}></div>
                                      <div className={`absolute right-0 top-full mt-2 flex p-1 gap-1 z-[9999] animate-in fade-in zoom-in-95 ${theme.settings.popover}`}>
                                        {['red', 'cyan', 'emerald', 'purple', 'yellow'].map(color => (
                                          <button
                                            key={color}
                                            onClick={() => { updateCategory(cat.id, 'colorTheme', color); setActivePicker(null); }}
                                            className={`w-6 h-6 rounded-full border border-slate-100/20 hover:scale-110 transition-transform ${color === 'red' ? 'bg-[#FFC0CB]' :
                                              (color === 'cyan' ? 'bg-[#AEE4FF]' :
                                                (color === 'emerald' ? 'bg-[#98FB98]' :
                                                  (color === 'purple' ? 'bg-[#DDA0DD]' : 'bg-[#FFB347]')))
                                              }`}
                                          />
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>

                                {/* 4. Delete Button (Inline & Aligned) */}
                                {confirmingCategoryDeleteId === cat.id ? (
                                  <div className="flex items-center gap-1 animate-in zoom-in-50 duration-200 ml-1">
                                    <button
                                      onClick={() => finalDeleteCategory(cat.id)}
                                      className={`w-6 h-6 flex items-center justify-center rounded-full shadow-sm transition-all ${currentTheme === 'developer' ? 'bg-[#E06C75] text-[#1E1E1E] rounded-none hover:bg-[#FF6B81]' : 'bg-[#FF6B81] text-white hover:bg-[#FF4757]'}`}
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setConfirmingCategoryDeleteId(null)}
                                      className={`w-6 h-6 flex items-center justify-center rounded-full shadow-sm transition-all ${currentTheme === 'developer' ? 'bg-[#2D2D2D] text-[#ABB2BF] border border-[#3E4451] rounded-none hover:bg-[#3E3E42]' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'}`}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setConfirmingCategoryDeleteId(cat.id)}
                                    className={`w-6 h-6 flex items-center justify-center transition-all shadow-sm ${theme.settings.listRow.deleteBtn} ${currentTheme === 'developer' ? 'w-auto px-2 text-[10px] font-bold hover:text-[#E06C75]' : 'rounded-full'}`}
                                  >
                                    {currentTheme === 'developer' ? '[DEL]' : <Trash2 className="w-3.5 h-3.5" />}
                                  </button>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                <button onClick={addCategory} className={`w-full mt-3 py-2 text-xs font-bold flex items-center justify-center gap-1 transition-all
                  ${currentTheme === 'princess'
                    ? 'bg-[#FFF0F5] border border-[#FFC0CB] text-[#FF6B81] rounded-2xl hover:bg-[#FF6B81] hover:text-white shadow-sm'
                    : (currentTheme === 'excel'
                      ? 'bg-[#F3F2F1] border border-[#D1D5DB] text-[#217346] rounded-none hover:bg-[#E1E1E1] hover:text-[#107C41]'
                      : (currentTheme === 'developer'
                        ? 'bg-transparent border border-dashed border-[#61AFEF] text-[#61AFEF] rounded-none hover:bg-[#61AFEF]/10 font-mono'
                        : 'border-dashed border-2 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 rounded'
                      )
                    )
                  }`}>
                  <Plus className="w-3.5 h-3.5" /> <span className="text-xs font-bold">추가</span>
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleResetRequest}
                className={`text-xs px-4 py-2 transition-all font-bold flex items-center justify-center gap-2
                  ${isResetConfirming
                    ? 'bg-red-600 text-white animate-pulse shadow-lg scale-105 ' + (currentTheme === 'excel' || currentTheme === 'developer' ? 'rounded-none' : 'rounded-full')
                    : (currentTheme === 'princess'
                      ? 'bg-[#FFF0F5] border border-[#FFC0CB] text-[#FF6B81] rounded-2xl hover:bg-[#FF6B81] hover:text-white shadow-sm'
                      : (currentTheme === 'excel'
                        ? 'bg-white border border-[#C00000] text-[#C00000] rounded-none hover:bg-[#C00000] hover:text-white'
                        : (currentTheme === 'developer'
                          ? 'bg-transparent border border-[#E06C75] text-[#E06C75] rounded-none hover:bg-[#E06C75] hover:text-[#282C34] font-mono'
                          : 'bg-red-50 text-red-500 hover:bg-red-100 rounded-lg'
                        )
                      )
                    )
                  }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {isResetConfirming ? '정말 초기화 할까요?' : '데이터 초기화'}
              </button>
            </div>

          </div>


        ) : (
          /* --- DASHBOARD MODE (Compact) with Custom Scrollbar --- */
          <>
            {/* ✨ Fixed Status Header (Integrated Timer) - Shows in Mini Mode ONLY if Timer is Active */}
            {(!isMiniMode || isTimerOpen) && (
              <div className={`shrink-0 transition-all min-h-[58px] flex flex-col justify-center ${currentTheme === 'princess' ? 'bg-white px-6 py-2 border-b border-[#FFC0CB]/30' : 'px-4 pt-4 pb-2 border-b border-slate-800/50'}`}>

                {isTimerOpen ? (
                  /* ✨ Compact Timer UI (Replaces Date/Progress) */
                  <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-300">
                    {/* ✨ Excel Theme Timer: Active Cell Style */}
                    {currentTheme === 'excel' ? (
                      <div className="flex items-center gap-2 w-full">
                        {/* Mode Indicator (Name Box Style) */}
                        <div className="flex items-center justify-center bg-white border border-[#D1D5DB] h-[28px] px-2 min-w-[60px] shadow-sm inset-shadow">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${timerMode === 'focus' ? 'text-[#217346]' : 'text-slate-500'}`}>
                            {timerMode === 'focus' ? 'Focus' : 'Break'}
                          </span>
                        </div>

                        {/* Separator */}
                        <div className="h-4 w-px bg-slate-300"></div>

                        {/* Time Display (Active Cell Style) */}
                        <div className="flex-1 flex items-center bg-white border-2 border-[#217346] h-[32px] px-3 shadow-sm relative">
                          <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-[#217346]"></div> {/* Drag Handle */}
                          <span className="text-xl font-mono font-bold tracking-widest text-slate-800 w-full text-right tabular-nums">
                            {formatTime(timeLeft)}
                          </span>
                        </div>

                        {/* Controls (Toolbar Style) */}
                        <div className="flex items-center bg-[#F3F2F1] rounded border border-[#D1D1D1] h-[28px]">
                          <button onClick={switchTimerMode} className="p-1.5 hover:bg-[#E1E1E1] text-slate-600 transition-colors border-r border-[#E1E1E1]" title="Switch Mode">
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={toggleTimer} className={`p-1.5 hover:bg-[#E1E1E1] transition-colors border-r border-[#E1E1E1] ${isTimerRunning ? 'text-[#217346]' : 'text-slate-700'}`}>
                            {isTimerRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                          </button>
                          <button onClick={() => setIsTimerOpen(false)} className="p-1.5 hover:bg-red-100 text-slate-500 hover:text-red-500 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Generic / Princess / Developer Timer */
                      <>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all
                          ${currentTheme === 'developer'
                            ? (timerMode === 'focus' ? 'text-[#E06C75] font-mono tracking-widest' : 'text-[#98C379] font-mono tracking-widest')
                            : (timerMode === 'focus'
                              ? (currentTheme === 'princess' ? 'bg-[#FF6B81]/10 text-[#FF6B81] border border-[#FF6B81]/20' : 'bg-red-500 text-white')
                              : (currentTheme === 'princess' ? 'bg-[#A0C4FF]/10 text-[#5B85AA] border border-[#A0C4FF]/20' : 'bg-green-500 text-white')
                            )
                          }`}>
                          {currentTheme === 'developer'
                            ? (timerMode === 'focus' ? '> FOCUS' : '> REST')
                            : (timerMode === 'focus' ? '🔥 집중' : '☕ 휴식')
                          }
                        </div>

                        <div className={`text-2xl tabular-nums tracking-widest ${currentTheme === 'princess' ? `${timerMode === 'focus' ? 'text-[#FF6B81]' : 'text-[#89CFF0]'} font-gamja font-medium` : 'text-slate-200 font-mono font-bold'}`}>
                          {formatTime(timeLeft)}
                        </div>

                        <div className="flex items-center gap-2">
                          <button onClick={switchTimerMode} className={`p-1 rounded-full text-slate-500 hover:bg-black/5 transition-colors ${currentTheme === 'developer' ? 'text-[#ABB2BF] hover:bg-[#3E3E42]' : (currentTheme === 'princess' ? 'text-slate-400' : '')}`} title="모드 전환">
                            <RotateCcw className="w-3 h-3" />
                          </button>
                          <button onClick={toggleTimer} className={`p-2 rounded-full transition-transform hover:scale-110 ${currentTheme === 'princess' ? `${timerMode === 'focus' ? 'bg-[#FF6B81]/10 text-[#FF6B81] hover:bg-[#FF6B81]/20' : 'bg-[#A0C4FF]/10 text-[#5B85AA] hover:bg-[#A0C4FF]/20'}` : (currentTheme === 'developer' ? 'text-[#ABB2BF] hover:text-white' : 'bg-slate-700 text-slate-200')}`}>
                            {isTimerRunning ? <Pause className="w-4 h-4 ml-px" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </button>
                          <button onClick={() => setIsTimerOpen(false)} className={`p-1 rounded-full text-slate-500 hover:bg-black/5 transition-colors ${currentTheme === 'developer' ? 'text-[#ABB2BF] hover:bg-[#3E3E42]' : (currentTheme === 'princess' ? 'text-slate-400' : '')}`}>
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  /* ✨ Default: Date & Progress or Excel Formula Bar */
                  currentTheme === 'excel' ? (
                    /* 📊 Excel Formula Bar Style */
                    <div className="flex items-center gap-2 px-1 py-1 bg-[#F3F2F1] border-b border-[#E1E1E1] text-xs font-sans text-[#444]">
                      <div className="font-serif italic text-slate-500 font-bold px-1">fx</div>
                      <div className="flex-1 bg-white border border-[#D1D5DB] px-2 py-0.5 text-slate-700 h-[22px] flex items-center gap-2 shadow-sm inset-shadow">
                        <span className="font-bold text-[#217346]">Total:</span> {totalTasks}
                        <span className="w-px h-3 bg-slate-300 mx-1"></span>
                        <span className="font-bold text-[#217346]">Done:</span> {completedTasks}
                        <span className="w-px h-3 bg-slate-300 mx-1"></span>
                        <span className="text-slate-400 italic whitespace-nowrap text-[11px] sm:text-xs">
                          {progressPercentage}% <span className="hidden min-[290px]:inline">Complete</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* ✨ Default Style */
                    <>
                      {/* 1. Statistics Row (Date Left, Count Right) */}
                      <div className="flex justify-between items-end mb-1">
                        {/* Left: Today's Date */}
                        <div className={`flex items-center gap-1 text-[11px] font-bold ${currentTheme === 'princess' ? 'text-[#FF6B81]' : 'text-slate-500'}`}>
                          <Calendar className="w-3 h-3" />
                          <span>{`${new Date().getMonth() + 1}월 ${new Date().getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][new Date().getDay()]})`}</span>
                        </div>

                        {/* Right: Task Count */}
                        <span className={`text-[11px] font-bold ${currentTheme === 'princess' ? 'text-[#FF6B81]' : 'text-slate-500'}`}>
                          {completedTasks}/{totalTasks} 완료
                        </span>
                      </div>

                      {/* 2. Progress Bar */}
                      <div className="relative">
                        <div className={`overflow-hidden h-1.5 mb-0 text-[10px] flex rounded-full ${currentTheme === 'princess' ? 'bg-white border border-[#FFC0CB]' : 'bg-slate-800 border border-slate-700'}`}>
                          <div
                            style={{ width: `${progressPercentage}%` }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-700 ease-out 
                              ${currentTheme === 'princess'
                                ? (progressPercentage === 100
                                  ? 'bg-gradient-to-r from-[#FDC830] to-[#F37335] animate-pulse shadow-[0_0_10px_#FDC830]'
                                  : 'bg-gradient-to-r from-[#FF9A9E] via-[#FECFEF] to-[#FF6B81]')
                                : getOverallProgressColor()}`}
                          ></div>
                        </div>
                      </div>
                    </>
                  )
                )}
              </div>
            )}

            <div className={`flex-1 flex flex-col overflow-y-auto custom-scrollbar ${currentTheme === 'princess' ? (isMiniMode ? 'p-1' : 'px-6 py-4') : 'p-3 sm:p-4'}`}>

              {/* Input Form (Compact) - ✨ HIDDEN IN MINI MODE */}
              {/* ✨ Main Add Task UI - Hidden for themes that have category-specific adders */}
              {!isMiniMode && !['princess', 'excel', 'developer'].includes(currentTheme) && (
                <form onSubmit={addTask} className={`w-full mb-4 p-3 rounded-lg border transition-all duration-300
                  ${currentTheme === 'princess'
                    ? 'bg-white border-[1.5px] border-[#FFC0CB] rounded-[16px] shadow-sm' // ✨ Simplified Princess Container
                    : (currentTheme === 'excel'
                      ? 'bg-white border border-[#D1D5DB] rounded-none shadow-none p-2.5'
                      : (currentTheme === 'developer'
                        ? 'bg-slate-800/50 border-slate-700/50 p-2.5 rounded border'
                        : 'bg-white/50 border-slate-200/50 p-2.5 rounded border'))}`}>

                  <div className="flex flex-col gap-2">

                    {/* Header / Label */}
                    <div className={`text-[10px] mb-2 font-bold flex items-center gap-1 ${currentTheme === 'princess' ? 'text-[#FF6B81] pl-1' : 'text-slate-500'}`}>
                      {currentTheme === 'princess' ? (
                        <>
                          <span className="text-xs">✨</span>
                          <span className="text-xs tracking-wide">할 일 추가</span>
                        </>
                      ) : (
                        currentTheme === 'excel' ? (
                          <span className="text-[#107C41] uppercase tracking-wider">New Entry</span>
                        ) : (
                          <>
                            <span className="text-[#98C379]">➜</span>
                            <span className="text-[#61AFEF]">~</span>
                            <span className="text-[#E5C07B]">add_task</span>
                          </>
                        )
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className={`${currentTheme === 'princess' ? 'w-full sm:w-1/3 min-w-[110px]' : ''}`}>
                        <StyledDropdown
                          value={selectedCategoryId}
                          onChange={(val) => setSelectedCategoryId(val)}
                          options={categories}
                          placeholder="카테고리"
                          currentTheme={currentTheme}
                        />
                      </div>

                      <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="할 일을 입력하세요..."
                        className={`flex-1 p-2 pl-3 border rounded text-sm focus:outline-none transition-all
                          ${currentTheme === 'princess'
                            ? 'bg-white border border-[#FFC0CB] text-slate-700 placeholder-slate-400 focus:border-[#FF6B81] focus:ring-1 focus:ring-[#FF6B81] rounded-[10px]'
                            : `${theme.settings.input} placeholder-slate-400`
                          }`}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {/* ⏰ Compact Time Picker with Date */}
                      <div className={`flex items-center gap-2 ${currentTheme === 'princess' ? 'bg-[#FFF0F5] p-1 rounded-[10px] pl-2 pr-1 border border-[#FFC0CB]/30' : ''}`}>
                        <CustomDatePicker
                          value={taskDate}
                          onChange={(e) => setTaskDate(e.target.value)}
                          placeholder="날짜"
                          inputClassName={currentTheme === 'princess'
                            ? 'bg-transparent text-[#FF6B81] font-bold text-sm focus:outline-none cursor-pointer w-20 text-center placeholder-pink-300'
                            : `${theme.settings.input} !h-9 !py-0 flex items-center justify-center`}
                          currentTheme={currentTheme}
                        />

                        {currentTheme === 'princess' && <span className="text-pink-200">|</span>}

                        <div className={`flex items-center gap-1 h-8 px-1
                          ${currentTheme === 'princess'
                            ? 'bg-transparent'
                            : `${currentTheme === 'developer' ? 'bg-[#282C34] border border-[#3E3E42] rounded-none' : (currentTheme === 'excel' ? 'bg-white border border-[#D1D5DB] rounded-none' : 'bg-white border border-slate-200 rounded')}`}`}>
                          <input
                            type="text"
                            value={taskHour}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 12)) setTaskHour(val);
                            }}
                            placeholder="12" maxLength={2}
                            className={`w-5 bg-transparent text-center text-[10px] focus:outline-none ${currentTheme === 'princess' ? 'text-slate-600 placeholder:text-pink-300 font-bold text-xs' : ''}`}
                          />
                          <span className={`text-[10px] font-bold ${currentTheme === 'princess' ? 'text-pink-300' : 'text-slate-500'}`}>:</span>
                          <input
                            type="text"
                            value={taskMinute}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 59)) setTaskMinute(val);
                            }}
                            placeholder="00" maxLength={2}
                            className={`w-5 bg-transparent text-center text-[10px] focus:outline-none ${currentTheme === 'princess' ? 'text-slate-600 placeholder:text-pink-300 font-bold text-xs' : ''}`}
                          />
                          <button type="button" onClick={() => setTaskAmpm(prev => prev === '오전' ? '오후' : '오전')} className={`ml-1 px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors ${currentTheme === 'princess' ? (taskAmpm === '오전' ? 'bg-[#FF6B81] text-white' : 'bg-[#A0C4FF] text-white') : (currentTheme === 'excel' ? (taskAmpm === '오전' ? 'bg-[#217346] text-white' : 'bg-[#E2F0D9] text-[#217346]') : 'bg-slate-200 text-slate-600')}`}>
                            {taskAmpm === '오전' ? 'AM' : 'PM'}
                          </button>
                        </div>
                      </div>

                      <button type="submit" className={`${theme.accent.bg} ${theme.accent.hover} text-white px-3 py-1.5 rounded font-medium transition-all flex items-center justify-center gap-1
                        ${currentTheme === 'princess'
                          ? 'bg-[#FF6B81] hover:bg-[#FF4757] text-white rounded-[10px] shadow-sm px-4 h-9'
                          : (currentTheme === 'excel' ? 'rounded-none shadow-none border border-[#1e6b41] w-[90px]' : 'shadow-sm w-[90px]')}`} disabled={categories.length === 0}>
                        {currentTheme === 'princess' ? <Plus className="w-4 h-4" /> : <Plus className="w-5 h-5 stroke-[3px]" />}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Task Lists */}
              {/* Task Lists */}
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="space-y-3 flex-1">
                  {categories.map(category => {
                    const categoryTasks = tasks.filter(t => t.categoryId === category.id);
                    const colorStyles = getThemeStyles(category.colorTheme);

                    // Constants moved to top of file
                    const categoryColor = CATEGORY_HUES[category.colorTheme] || '#FBCFE8';
                    const borderIdle = hexToRgba(categoryColor, 0.6); // Weak border (60% opacity)
                    const borderHover = categoryColor; // Full color on hover

                    const headerBg = currentTheme === 'princess'
                      ? hexToRgba(categoryColor, 0.45)
                      : undefined;

                    return (
                      <div key={category.id} className={`${theme.category.container} 
                        ${currentTheme === 'princess'
                          ? (isMiniMode ? 'bg-white rounded-[15px] shadow-[0_4px_10px_rgba(255,182,193,0.4)] mb-3 mx-2 mt-2 border-none !w-auto' : colorStyles.border) // ✨ Mini Mode: White Card Widget Style (No Margin, Parent Handles Padding)
                          : (currentTheme === 'developer' ? colorStyles.border + ' ' + colorStyles.bg + ' bg-opacity-5' : '')} transition-all duration-300`}>
                        <div
                          className={`${theme.category.header} 
                            ${currentTheme === 'princess'
                              ? (isMiniMode ? 'bg-transparent border-none px-3 py-1.5 rounded-t-[15px]' : colorStyles.border + ' border-b-2 border-dashed mx-[6px] mt-[6px] rounded-t-[15px]') // ✨ Mini Mode: Compact Header with Rounded Top
                              : (currentTheme === 'developer' ? 'bg-black/10 border-inherit' : '')}`}
                          style={currentTheme === 'princess' ? { backgroundColor: headerBg } : {}}
                        >
                          {getIcon(category.icon, `${isMiniMode ? 'w-3 h-3' : 'w-4 h-4'} ${colorStyles.icon}`)}
                          <h3 className={`${theme.category.title} ${colorStyles.text} truncate ${isMiniMode ? 'text-xs' : (fontSize === 'large' ? 'text-lg' : 'text-base')}`}>{category.label}</h3>
                          <div className="flex items-center gap-2 ml-auto">
                            <span className={`${currentTheme === 'princess' ? (isMiniMode ? 'hidden' : 'inline') : (currentTheme === 'developer' || currentTheme === 'excel' ? 'hidden' : 'inline')}`} style={{ opacity: 0.3 }}>
                              {/* Line or Decoration */}
                            </span>
                            {/* ✨ Quick Add Button (Header) - Improved Design */}
                            <button
                              onClick={(e) => { e.stopPropagation(); setMiniModeAdderId(miniModeAdderId === category.id ? null : category.id); }}
                              data-trigger-id={category.id}
                              style={currentTheme === 'princess' ? {
                                color: miniModeAdderId === category.id ? '#FFFFFF' : (CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185'),
                                backgroundColor: miniModeAdderId === category.id ? (CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185') : 'transparent',
                                borderColor: (CATEGORY_HUES[category.colorTheme] || '#FBCFE8')
                              } : {}}
                              className={`flex items-center justify-center transition-all duration-300 mr-2 shadow-sm active:scale-95 group
                              ${currentTheme === 'princess'
                                  ? 'w-6 h-6 rounded-[8px] border hover:shadow-md'
                                  : (currentTheme === 'excel' ? 'w-5 h-5 bg-[#F3F2F1] text-[#217346] hover:bg-[#217346] hover:text-white border border-[#D1D1D1] rounded-none' : 'w-5 h-5 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white rounded-md')}`}
                              onMouseEnter={(e) => { if (currentTheme === 'princess') { e.currentTarget.style.backgroundColor = (CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185'); e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'transparent'; } }}
                              onMouseLeave={(e) => { if (currentTheme === 'princess' && miniModeAdderId !== category.id) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = (CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185'); e.currentTarget.style.borderColor = (CATEGORY_HUES[category.colorTheme] || '#FBCFE8'); } }}
                              title="Add Task"
                            >
                              <Plus className={`${currentTheme === 'princess' ? 'w-3.5 h-3.5 stroke-[3px]' : 'w-3.5 h-3.5'}`} />
                            </button>

                            <span
                              style={currentTheme === 'princess' ? {
                                color: CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185',
                                borderColor: CATEGORY_HUES[category.colorTheme] || '#FFC0CB'
                              } : {}}
                              className={`text-[10px] font-bold px-2 py-0.5 transition-all
                            ${currentTheme === 'princess'
                                  ? 'bg-white/50 rounded-full border'
                                  : (currentTheme === 'excel'
                                    ? 'bg-white border border-[#D1D1D1] rounded-none text-slate-600 shadow-sm'
                                    : 'bg-slate-700/50 text-slate-400 rounded-full border border-slate-600/30'
                                  )
                                }`}>
                              {categoryTasks.filter(t => t.completed).length} / {categoryTasks.length}
                            </span>
                          </div>
                        </div>

                        <Droppable droppableId={String(category.id)}>
                          {(provided, snapshot) => {
                            const dropBg = currentTheme === 'princess' && snapshot.isDraggingOver
                              ? hexToRgba(CATEGORY_HUES[category.colorTheme] || '#FF6B81', 0.12)
                              : undefined;

                            return (
                              <div
                                className={`p-1 ${isMiniMode ? 'pb-1 pt-0' : 'pb-1'} space-y-1 min-h-[60px] transition-colors duration-200 ${snapshot.isDraggingOver ? (currentTheme === 'princess' ? 'rounded-b-[15px]' : 'bg-slate-800/50 rounded') : ''} ${currentTheme === 'princess' ? (isMiniMode ? 'mx-[6px] mb-0 rounded-b-[15px] -mt-1.5' : 'mx-[6px] mb-[6px] rounded-b-[15px]') : ''}`}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={currentTheme === 'princess' ? { backgroundColor: dropBg } : {}}
                              >
                                {categoryTasks.length === 0 && !snapshot.isDraggingOver && (
                                  <p className={`text-[10px] italic p-1.5 py-4 opacity-50 text-center ${currentTheme === 'princess' ? 'text-[#D8A0A6]' : 'text-slate-600'}`}>비어 있음</p>
                                )}

                                {categoryTasks.map((task, index) => (
                                  <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                                    {(provided, snapshot) => (
                                      <TaskItem
                                        task={task}
                                        index={index}
                                        provided={provided}
                                        snapshot={snapshot}
                                        currentTheme={currentTheme}
                                        theme={theme}
                                        isMiniMode={isMiniMode}
                                        fontSize={fontSize}
                                        getTextSizeClass={getTextSizeClass}
                                        getSubTextSizeClass={getSubTextSizeClass}
                                        formatTimeDisplay={formatTimeDisplay}
                                        category={category}
                                        borderIdle={borderIdle}
                                        borderHover={borderHover}
                                        CATEGORY_ICON_HUES={CATEGORY_ICON_HUES}
                                        toggleTask={toggleTask}
                                        editingTaskId={editingTaskId}
                                        startEditing={startEditing}
                                        saveEditing={saveEditing}
                                        cancelEditing={cancelEditing}
                                        editingText={editingText}
                                        setEditingText={setEditingText}
                                        editingDate={editingDate}
                                        setEditingDate={setEditingDate}
                                        editingHour={editingHour}
                                        setEditingHour={setEditingHour}
                                        editingMinute={editingMinute}
                                        setEditingMinute={setEditingMinute}
                                        editingAmpm={editingAmpm}
                                        setEditingAmpm={setEditingAmpm}
                                        confirmingDeleteId={confirmingDeleteId}
                                        setConfirmingDeleteId={setConfirmingDeleteId}
                                        finalDeleteTask={finalDeleteTask}
                                        notifications={notifications}
                                        editFormRef={editFormRef}
                                      />
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )
                          }}
                        </Droppable>

                        {/* ✨ Quick Add Form (Collapsible) */}
                        <div ref={miniModeAdderId === category.id ? miniModeFormRef : null} className={`${miniModeAdderId === category.id ? 'max-h-80 opacity-100 mb-4 px-2 overflow-visible' : 'max-h-0 opacity-0 px-2 overflow-hidden'} transition-all duration-300 ease-in-out`}>
                          <form
                            onSubmit={(e) => addTask(e, category.id)}
                            className={`transition-all duration-300 w-full z-10 relative
                                 ${currentTheme === 'princess'
                                ? 'bg-white p-3 rounded-[16px] border-[1.5px] border-[#FFC0CB] shadow-sm flex flex-col gap-2' // ✨ Simplified Princess Box
                                : (currentTheme === 'excel'
                                  ? 'bg-white border border-[#107C41] shadow-md p-0 grid gap-0'
                                  : 'bg-[#252526] border border-[#007ACC] shadow-2xl p-4 rounded-md font-mono')}`}
                          >
                            {/* Input Area */}
                            <div className={`${currentTheme === 'excel' ? 'bg-[#F3F2F1] p-2' : 'relative'}`}>
                              {currentTheme === 'developer' && <span className="absolute left-2 top-1.5 text-[#569CD6] mr-2 text-xs">{'>'}</span>}
                              <input
                                type="text"
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                placeholder={currentTheme === 'excel' ? '새 할 일을 입력하세요...' : "할 일을 입력하세요..."}
                                className={`w-full outline-none transition-all
                                      ${currentTheme === 'princess'
                                    ? 'text-sm p-2 bg-white border border-[#FFC0CB] text-slate-600 placeholder-slate-400 focus:border-[#FF6B81] rounded-[10px]'
                                    : (currentTheme === 'excel'
                                      ? 'text-sm p-2 font-sans text-slate-800 border border-[#D1D1D1] bg-white focus:border-[#217346]'
                                      : 'text-sm p-1.5 pl-4 bg-[#3C3C3C] text-[#D4D4D4] placeholder-[#5C6370] font-mono border border-[#3E3E42] focus:border-[#007ACC]')}`}
                                autoFocus
                              />
                            </div>

                            {/* Controls Area - Mobile First Vertical Stack */}
                            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2
                                ${currentTheme === 'princess' ? 'mt-0' : (currentTheme === 'excel' ? 'bg-[#F3F2F1] border-t border-[#D1D1D1] p-2' : 'mt-4')}`}>

                              {/* Left: Date/Time */}
                              <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-2 w-full sm:w-auto ${currentTheme === 'princess' ? 'bg-[#FFF0F5] p-1 rounded-[10px] pl-2 pr-1 border border-[#FFC0CB]/30' : ''}`}>
                                <CustomDatePicker
                                  value={taskDate}
                                  onChange={(e) => setTaskDate(e.target.value)}
                                  placeholder="Date"
                                  inputClassName={`outline-none text-center bg-transparent cursor-pointer
                                          ${currentTheme === 'princess' ? 'text-[#FF6B81] font-medium text-xs w-20 placeholder-pink-300' : (currentTheme === 'excel' ? 'bg-white border border-[#D1D1D1] h-6 w-24 text-xs p-1' : 'bg-[#1E1E1E] text-[#CE9178] w-24 border-none text-xs')}`}
                                  currentTheme={currentTheme}
                                />
                                {currentTheme === 'princess' && <span className="text-pink-200 text-[10px] hidden sm:inline">|</span>}
                                <div className="flex items-center gap-1">
                                  <input type="text" value={taskHour} onChange={(e) => setTaskHour(e.target.value.replace(/[^0-9]/g, ''))} placeholder="12" maxLength={2} className={`w-8 sm:w-5 text-center outline-none bg-transparent ${currentTheme === 'princess' ? 'text-slate-600 font-medium text-xs' : (currentTheme === 'excel' ? 'bg-white border border-[#D1D1D1] h-6 text-xs' : 'text-[#D19A66] text-xs')}`} />
                                  <span className={`${currentTheme === 'princess' ? 'text-pink-300 text-xs' : 'text-slate-400'}`}>:</span>
                                  <input type="text" value={taskMinute} onChange={(e) => setTaskMinute(e.target.value.replace(/[^0-9]/g, ''))} placeholder="00" maxLength={2} className={`w-8 sm:w-5 text-center outline-none bg-transparent ${currentTheme === 'princess' ? 'text-slate-600 font-medium text-xs' : (currentTheme === 'excel' ? 'bg-white border border-[#D1D1D1] h-6 text-xs' : 'text-[#D19A66] text-xs')}`} />
                                  <button type="button" onClick={() => setTaskAmpm(p => p === '오전' ? '오후' : '오전')} className={`ml-1 flex items-center justify-center transition-all ${currentTheme === 'princess' ? 'px-1.5 py-0.5 rounded bg-[#FF6B81] text-white text-[9px] font-medium' : (currentTheme === 'excel' ? 'bg-white border border-[#D1D1D1] h-6 px-1 text-[10px]' : 'text-[#569CD6] text-xs')}`}>{taskAmpm === '오전' ? 'AM' : 'PM'}</button>
                                </div>
                              </div>

                              {/* Right: Actions */}
                              <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                                {/* Cancel */}
                                <button
                                  type="button"
                                  onClick={() => setMiniModeAdderId(null)}
                                  className={`flex items-center justify-center transition-all cursor-pointer flex-1 sm:flex-none
                                      ${currentTheme === 'princess'
                                      ? 'h-8 sm:w-7 sm:h-7 rounded-[8px] bg-slate-100 text-slate-400 hover:bg-slate-200'
                                      : (currentTheme === 'excel' ? 'w-full sm:w-auto px-4 py-1 bg-white border border-[#D1D1D1] hover:bg-slate-100 text-xs text-slate-700' : 'w-full sm:w-auto text-[#ABB2BF] text-xs hover:bg-[#3E3E42] px-3 py-1 rounded')}`}
                                  title="취소"
                                >
                                  {currentTheme === 'excel' ? 'Cancel' : (currentTheme === 'developer' ? '[ESC]' : <X className="w-4 h-4" />)}
                                </button>
                                {/* Submit */}
                                <button
                                  type="submit"
                                  className={`flex items-center justify-center transition-transform active:scale-95 cursor-pointer flex-1 sm:flex-none
                                      ${currentTheme === 'princess'
                                      ? 'h-8 sm:w-7 sm:h-7 rounded-[8px] bg-[#FF6B81] text-white hover:bg-[#FF4757] shadow-sm'
                                      : (currentTheme === 'excel' ? 'w-full sm:w-auto px-4 py-1 bg-[#107C41] text-white hover:bg-[#0E6032] text-xs font-bold border border-[#107C41]' : 'w-full sm:w-auto bg-[#007ACC] text-white text-xs hover:bg-[#0062A3] px-3 py-1 rounded')}`}
                                  title="추가"
                                >
                                  {currentTheme === 'excel' ? 'Add' : (currentTheme === 'developer' ? '[ENTER]' : <Check className="w-4 h-4 stroke-[2.5px]" />)}
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>


                      </div>
                    );
                  })}
                </div>
              </DragDropContext>
            </div>


            {/* Footer - ✨ HIDDEN IN MINI MODE */}
            {
              !isSettingsOpen && !isMiniMode && (
                <div className={`mt-auto p-2 border-t ${currentTheme === 'princess'
                  ? 'border-[#FFC0CB] bg-[#FFF0F5]'
                  : (currentTheme === 'developer'
                    ? 'bg-[#21252B] border-[#3E3E42]'
                    : (currentTheme === 'excel' ? 'bg-[#217346] text-white border-t-4 border-[#107C41]' : 'border-slate-800 bg-slate-900/50') // ✨ Excel Status Bar
                  )} text-center shrink-0`}>
                  <p className={`text-[9px] font-mono ${currentTheme === 'princess' ? 'text-[#F472B6] font-bold tracking-widest' : (currentTheme === 'excel' ? 'text-white font-sans text-left px-2 font-bold' : 'text-slate-600')}`}>
                    {currentTheme === 'princess' ? 'Code Tiara 💖 (Created by Lumora)' : (currentTheme === 'excel' ? 'Ready' : 'Code Tiara v1.1.0 (Created by Lumora)')}
                  </p>
                </div>
              )
            }

            {/* ✨ Custom Delete Confirmation Modal */}
            {
              taskToDelete && (
                <div className={`fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4`} onClick={() => setTaskToDelete(null)}>
                  <div
                    data-delete-type="task" // ✨ Target for click-outside
                    className={`w-full max-w-sm p-6 transition-all relative overflow-hidden
                  ${currentTheme === 'princess'
                        ? 'bg-white border-[#FFF0F5] border rounded-[28px] shadow-[0_10px_40px_rgba(255,182,193,0.5)]'
                        : (currentTheme === 'excel'
                          ? 'bg-white border-2 border-[#107C41] shadow-2xl rounded-none p-0'
                          : 'bg-[#1E1E1E] border border-[#3E3E42] rounded shadow-xl font-mono')}`}
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className={`flex items-center gap-3 mb-4 
                      ${currentTheme === 'excel' ? 'bg-[#107C41] p-3 -m-6 mb-4 text-white' : ''}`}>
                      <div className={`flex items-center justify-center
                        ${currentTheme === 'princess' ? 'w-10 h-10 bg-[#FFF0F5] rounded-full text-[#FF6B81]' : ''}`}>
                        {currentTheme === 'princess' ? <AlertTriangle className="w-5 h-5 stroke-[2.5px]" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                      </div>
                      <h3 className={`font-bold text-lg 
                        ${currentTheme === 'princess' ? 'text-slate-700 font-[Gaegu] tracking-wide' : (currentTheme === 'excel' ? 'text-white' : 'text-[#E06C75]')}`}>
                        {currentTheme === 'excel' ? 'Confirm Deletion' : (currentTheme === 'developer' ? 'ERR_CONFIRM_DELETE' : '할 일 삭제')}
                      </h3>
                    </div>

                    {/* Content */}
                    <p className={`text-sm mb-8 break-all whitespace-normal leading-relaxed 
                      ${currentTheme === 'princess' ? 'text-slate-500' : (currentTheme === 'excel' ? 'text-slate-800 px-2' : 'text-[#ABB2BF]')}`}>
                      정말로 <span className={`font-bold inline-block max-w-full truncate align-bottom ${currentTheme === 'princess' ? 'text-[#FF6B81] bg-[#FFF0F5] px-2 py-0.5 rounded-lg' : (currentTheme === 'excel' ? 'text-[#107C41] border-b border-[#107C41]' : 'text-[#E06C75]')}`}>'{tasks.find(t => t.id === taskToDelete)?.text}'</span>을(를) <br />삭제하시겠습니까?
                    </p>

                    {/* Actions */}
                    <div className={`flex justify-end gap-2 ${currentTheme === 'excel' ? 'bg-[#F3F2F1] p-3 -m-6 mt-4 border-t border-[#D1D1D1]' : ''}`}>
                      <button
                        onClick={() => setTaskToDelete(null)}
                        className={`transition-all font-bold
                      ${currentTheme === 'princess'
                            ? 'px-5 py-2.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs'
                            : (currentTheme === 'excel'
                              ? 'px-6 py-1 bg-white border border-[#D1D1D1] text-xs hover:bg-[#E1E1E1] shadow-sm text-slate-700'
                              : 'px-4 py-2 text-[#ABB2BF] hover:bg-[#2C313A] text-xs rounded border border-transparent hover:border-[#3E4451]')}`}
                      >
                        {currentTheme === 'excel' ? '취소' : (currentTheme === 'developer' ? '[CANCEL]' : '취소')}
                      </button>
                      <button
                        onClick={() => confirmDeleteTask()}
                        className={`transition-all font-bold shadow-sm
                      ${currentTheme === 'princess'
                            ? 'px-5 py-2.5 rounded-full bg-[#FF6B81] text-white hover:bg-[#FF5271] hover:shadow-lg hover:-translate-y-0.5 text-xs'
                            : (currentTheme === 'excel'
                              ? 'px-6 py-1 bg-[#107C41] text-white border border-[#107C41] hover:bg-[#0E6032] text-xs shadow-sm'
                              : 'px-4 py-2 bg-[#E06C75]/10 text-[#E06C75] border border-[#E06C75]/50 hover:bg-[#E06C75]/20 text-xs rounded')}`}
                      >
                        {currentTheme === 'excel' ? '삭제' : (currentTheme === 'developer' ? '[CONFIRM]' : '삭제')}
                      </button>
                    </div>
                  </div>
                </div>
              )
            }

            {/* ✨ Category Delete Confirmation Modal */}
            {
              categoryToDelete && (
                <div className={`fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4`} onClick={() => setCategoryToDelete(null)}>
                  <div
                    data-delete-type="category" // ✨ Target for click-outside
                    className={`w-full max-w-sm p-6 transition-all relative overflow-hidden
                  ${currentTheme === 'princess'
                        ? 'bg-white border-[#FFF0F5] border rounded-[28px] shadow-[0_10px_40px_rgba(255,182,193,0.5)]'
                        : (currentTheme === 'excel'
                          ? 'bg-white border-2 border-[#107C41] shadow-2xl rounded-none p-0'
                          : 'bg-[#1E1E1E] border border-[#3E3E42] rounded shadow-xl font-mono')}`}
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className={`flex items-center gap-3 mb-4 
                      ${currentTheme === 'excel' ? 'bg-[#107C41] p-3 -m-6 mb-4 text-white' : ''}`}>
                      <div className={`flex items-center justify-center
                        ${currentTheme === 'princess' ? 'w-10 h-10 bg-[#FFF0F5] rounded-full text-[#FF6B81]' : ''}`}>
                        {currentTheme === 'princess' ? <AlertTriangle className="w-5 h-5 stroke-[2.5px]" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                      </div>
                      <h3 className={`font-bold text-lg 
                        ${currentTheme === 'princess' ? 'text-slate-700 font-[Gaegu] tracking-wide' : (currentTheme === 'excel' ? 'text-white' : 'text-[#E06C75]')}`}>
                        {currentTheme === 'excel' ? 'Confirm Deletion' : (currentTheme === 'developer' ? 'ERR_CONFIRM_DELETE' : '카테고리 삭제')}
                      </h3>
                    </div>

                    {/* Content */}
                    <p className={`text-sm mb-8 break-all whitespace-normal leading-relaxed 
                      ${currentTheme === 'princess' ? 'text-slate-500' : (currentTheme === 'excel' ? 'text-slate-800 px-2' : 'text-[#ABB2BF]')}`}>
                      정말로 <span className={`font-bold inline-block max-w-full truncate align-bottom ${currentTheme === 'princess' ? 'text-[#FF6B81] bg-[#FFF0F5] px-2 py-0.5 rounded-lg' : (currentTheme === 'excel' ? 'text-[#107C41] border-b border-[#107C41]' : 'text-[#E06C75]')}`}>'{categories.find(c => c.id === categoryToDelete)?.label}'</span> 카테고리를 <br />삭제하시겠습니까? (할 일도 삭제됩니다)
                    </p>

                    {/* Actions */}
                    <div className={`flex justify-end gap-2 ${currentTheme === 'excel' ? 'bg-[#F3F2F1] p-3 -m-6 mt-4 border-t border-[#D1D1D1]' : ''}`}>
                      <button
                        onClick={() => setCategoryToDelete(null)}
                        className={`transition-all font-bold
                      ${currentTheme === 'princess'
                            ? 'px-5 py-2.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs'
                            : (currentTheme === 'excel'
                              ? 'px-6 py-1 bg-white border border-[#D1D1D1] text-xs hover:bg-[#E1E1E1] shadow-sm text-slate-700'
                              : 'px-4 py-2 text-[#ABB2BF] hover:bg-[#2C313A] text-xs rounded border border-transparent hover:border-[#3E4451]')}`}
                      >
                        {currentTheme === 'excel' ? '취소' : (currentTheme === 'developer' ? '[CANCEL]' : '취소')}
                      </button>
                      <button
                        onClick={() => confirmDeleteCategory()}
                        className={`transition-all font-bold shadow-sm
                      ${currentTheme === 'princess'
                            ? 'px-5 py-2.5 rounded-full bg-[#FF6B81] text-white hover:bg-[#FF5271] hover:shadow-lg hover:-translate-y-0.5 text-xs'
                            : (currentTheme === 'excel'
                              ? 'px-6 py-1 bg-[#107C41] text-white border border-[#107C41] hover:bg-[#0E6032] text-xs shadow-sm'
                              : 'px-4 py-2 bg-[#E06C75]/10 text-[#E06C75] border border-[#E06C75]/50 hover:bg-[#E06C75]/20 text-xs rounded')}`}
                      >
                        {currentTheme === 'excel' ? '삭제' : (currentTheme === 'developer' ? '[CONFIRM]' : '삭제')}
                      </button>
                    </div>
                  </div>
                </div>
              )
            }
            {/* ✨ Clear Completed Confirmation Modal */}
            {
              isClearConfirmOpen && (
                <div className={`fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4`} onClick={() => setIsClearConfirmOpen(false)}>
                  <div
                    className={`w-full max-w-sm p-6 transition-all relative overflow-hidden
                  ${currentTheme === 'princess'
                        ? 'bg-white border-[#FFF0F5] border rounded-[28px] shadow-[0_10px_40px_rgba(255,182,193,0.5)]'
                        : (currentTheme === 'excel'
                          ? 'bg-white border-2 border-[#107C41] shadow-2xl rounded-none p-0'
                          : 'bg-[#1E1E1E] border border-[#3E3E42] rounded shadow-xl font-mono')}`}
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className={`flex items-center gap-3 mb-4 
                      ${currentTheme === 'excel' ? 'bg-[#107C41] p-3 -m-6 mb-4 text-white' : ''}`}>
                      <div className={`flex items-center justify-center
                        ${currentTheme === 'princess' ? 'w-10 h-10 bg-[#FFF0F5] rounded-full text-[#FF6B81]' : ''}`}>
                        {currentTheme === 'princess' ? <AlertTriangle className="w-5 h-5 stroke-[2.5px]" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                      </div>
                      <h3 className={`font-bold text-lg 
                        ${currentTheme === 'princess' ? 'text-slate-700 font-[Gaegu] tracking-wide' : (currentTheme === 'excel' ? 'text-white' : 'text-[#E06C75]')}`}>
                        {currentTheme === 'excel' ? 'Confirm Cleanup' : (currentTheme === 'developer' ? 'ERR_CONFIRM_CLEAR' : '완료 항목 정리')}
                      </h3>
                    </div>

                    {/* Content */}
                    <p className={`text-sm mb-8 break-all whitespace-normal leading-relaxed 
                      ${currentTheme === 'princess' ? 'text-slate-500' : (currentTheme === 'excel' ? 'text-slate-800 px-6 mt-4' : 'text-[#ABB2BF]')}`}>
                      정말로 완료된 모든 항목을 <br />삭제하시겠습니까?
                    </p>

                    {/* Actions */}
                    <div className={`flex justify-end gap-2 ${currentTheme === 'excel' ? 'bg-[#F3F2F1] p-3 -m-6 mt-4 border-t border-[#D1D1D1]' : ''}`}>
                      <button
                        onClick={() => setIsClearConfirmOpen(false)}
                        className={`transition-all font-bold
                      ${currentTheme === 'princess'
                            ? 'px-5 py-2.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs'
                            : (currentTheme === 'excel'
                              ? 'px-6 py-1 bg-white border border-[#D1D1D1] text-xs hover:bg-[#E1E1E1] shadow-sm text-slate-700'
                              : 'px-4 py-2 text-[#ABB2BF] hover:bg-[#2C313A] text-xs rounded border border-transparent hover:border-[#3E4451]')}`}
                      >
                        {currentTheme === 'excel' ? '취소' : (currentTheme === 'developer' ? '[CANCEL]' : '취소')}
                      </button>
                      <button
                        onClick={() => clearCompletedTasks()}
                        className={`transition-all font-bold shadow-sm
                      ${currentTheme === 'princess'
                            ? 'px-5 py-2.5 rounded-full bg-[#FF6B81] text-white hover:bg-[#FF5271] hover:shadow-lg hover:-translate-y-0.5 text-xs'
                            : (currentTheme === 'excel'
                              ? 'px-6 py-1 bg-[#107C41] text-white border border-[#107C41] hover:bg-[#0E6032] text-xs shadow-sm'
                              : 'px-4 py-2 bg-[#E06C75]/10 text-[#E06C75] border border-[#E06C75]/50 hover:bg-[#E06C75]/20 text-xs rounded')}`}
                      >
                        {currentTheme === 'excel' ? '정리' : (currentTheme === 'developer' ? '[CONFIRM]' : '삭제')}
                      </button>
                    </div>
                  </div>
                </div>
              )
            }
          </>

        )
        }
      </div >
    </div >
  );
};

export default LumoraDashboard;
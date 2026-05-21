import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Trash2, Plus, CheckCircle2, Circle, Zap, Code, BookOpen, Laptop,
  Terminal, Command, Settings, X, Save, RotateCcw, AlertTriangle,
  Download, Upload, Timer, Pause, Play, ChevronUp, ChevronDown, Clock, Bell,
  Star, Coffee, Music, Home, Briefcase, Heart, Sun, Moon, Hourglass,
  PanelTopClose, PanelTopOpen, Edit2, Check, Grid2X2, Calendar, Minus, GripVertical, Menu, Gift,
  ChevronLeft, ChevronRight, Repeat, Pin, PinOff
} from 'lucide-react';
import CustomDatePicker from './components/CustomDatePicker';
import TaskItem from './components/TaskItem';
import SettingsPanel from './components/SettingsPanel';
import OnboardingPanel from './components/OnboardingPanel';
import AuthScreen from './components/AuthScreen';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CATEGORY_HUES, CATEGORY_ICON_HUES, hexToRgba, getLocalDateString, parseLocalDate } from './constants';
import { THEME_CONFIG } from './constants/themeConfig';
import {
  auth,
  db,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  query,
  where
} from './firebase/firebaseConfig';

// ✨ Constants imported from constants.js
console.log('App.js imports:', { AuthScreen, CustomDatePicker, TaskItem, SettingsPanel, OnboardingPanel });

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
  const theme = THEME_CONFIG[currentTheme] || THEME_CONFIG['developer'];
  const styles = theme.dropdown;

  return (
    <div className={`relative w-1/3 min-w-[100px]`} ref={dropdownRef}>
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
                className={`w-full text-left px-3 py-2 text-sm mb-0.5 transition-colors ${value === opt.id
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

const CodeTiara = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isGuestModeRef = useRef(false); // 게스트 모드 보호용 ref




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
    const saved = localStorage.getItem('lumora_font_size');
    if (!saved) return 14;
    if (isNaN(saved)) {
      switch (saved) {
        case 'x-small': return 12;
        case 'small': return 14;
        case 'medium': return 16;
        case 'large': return 18;
        case 'x-large': return 22;
        default: return 14;
      }
    }
    return Number(saved);
  });

  const [fontFamily, setFontFamily] = useState(() => {
    return localStorage.getItem('lumora_font_family') || 'default';
  });

  // --- 🎨 테마 설정 State ---
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('lumora_theme') || 'princess';
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
  // THEME_CONFIG imported from constants/themeConfig.js

  const theme = THEME_CONFIG[currentTheme];

  const rootClassName = `h-screen w-screen theme-${currentTheme} ${theme.root} flex overflow-hidden`;
  const cardClassName = `w-full h-full ${theme.card} overflow-hidden flex flex-col relative transition-all`;

  const getFontScaleMultiplier = (fontFamily, themeId, size) => {
    let baseScale = 1.0;
    if (fontFamily === 'Gamja Flower' || (fontFamily === 'default' && themeId === 'princess')) {
      baseScale = 1.2; // Gamja Flower is handwritten and a bit small
    } else {
      switch (fontFamily) {
        case 'Dongle':
          baseScale = 1.45; // Dongle is exceptionally tiny
          break;
        case 'Gaegu':
          baseScale = 1.15; // Gaegu is slightly small
          break;
        case 'Nanum Pen Script':
          baseScale = 1.25; // Nanum Pen Script is handwritten and thin
          break;
        default:
          baseScale = 1.0;
      }
    }

    if (baseScale === 1.0) return 1.0;

    // Taper factor based on size/class to avoid oversized header fonts
    let factor = 1.0;
    if (typeof size === 'number') {
      if (size <= 12) factor = 1.0;
      else if (size <= 14) factor = 0.8;
      else if (size <= 16) factor = 0.6;
      else if (size <= 18) factor = 0.4;
      else if (size <= 22) factor = 0.2;
      else factor = 0.1;
    } else if (typeof size === 'string') {
      switch (size) {
        case 'text-[10px]':
        case 'text-[11px]':
        case 'text-xs':
          factor = 1.0;
          break;
        case 'text-sm':
          factor = 0.8;
          break;
        case 'text-base':
          factor = 0.6;
          break;
        case 'text-lg':
          factor = 0.4;
          break;
        case 'text-xl':
          factor = 0.2;
          break;
        default:
          factor = 0.1;
      }
    }

    return 1 + (baseScale - 1) * factor;
  };

  // 폰트 크기에 따른 텍스트 클래스 매핑
  const getTextSizeClass = (size) => {
    if (typeof size === 'number') return '';
    switch (size) {
      case 'x-small': return 'text-xs';
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      case 'x-large': return 'text-xl';
      default: return 'text-sm'; // small
    }
  };

  const getSubTextSizeClass = (size) => {
    if (typeof size === 'number') return '';
    switch (size) {
      case 'x-small': return 'text-[10px]';
      case 'small': return 'text-[11px]';
      case 'medium': return 'text-xs';
      case 'large': return 'text-sm';
      case 'x-large': return 'text-base';
      default: return 'text-[11px]'; // small
    }
  };

  // --- ✏️ 수정 모드 State ---
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [editingMemo, setEditingMemo] = useState('');
  const [editingDate, setEditingDate] = useState(''); // ✨ 수정 모드 날짜
  const [editingHour, setEditingHour] = useState('');
  const [editingMinute, setEditingMinute] = useState('');
  const [editingAmpm, setEditingAmpm] = useState('오전');

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskMemo, setNewTaskMemo] = useState('');
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null); // ✨ Inline Delete Confirmation State // ✨ 삭제 확인 모달 State
  const [confirmingCategoryDeleteId, setConfirmingCategoryDeleteId] = useState(null); // ✨ Inline Category Delete State
  const [taskDate, setTaskDate] = useState(''); // ✨ 새 작업 날짜
  const [taskHour, setTaskHour] = useState('');
  const [taskMinute, setTaskMinute] = useState('');
  const [taskAmpm, setTaskAmpm] = useState('오전');
  
  // ✨ 반복 및 필터 State
  const [taskRecurrence, setTaskRecurrence] = useState('none');
  const [taskRecurrenceInterval, setTaskRecurrenceInterval] = useState(1);
  const [editingRecurrence, setEditingRecurrence] = useState('none');
  const [editingRecurrenceInterval, setEditingRecurrenceInterval] = useState(1);

  // ✨ Auto-resize height tracking ref
  const lastCalculatedHeightRef = useRef(null);
  const [taskRecurrenceDays, setTaskRecurrenceDays] = useState([]);
  const [editingRecurrenceDays, setEditingRecurrenceDays] = useState([]);
  const [filterMode, setFilterMode] = useState(() => {
    return localStorage.getItem('lumora_filter_mode') || 'all';
  });
  const [filterDate, setFilterDate] = useState(() => {
    return localStorage.getItem('lumora_filter_date') || getLocalDateString();
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // UI 상태 관리
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isResetConfirming, setIsResetConfirming] = useState(false);
  const fileInputRef = useRef(null);



  // --- 🔔 알림(Notification) State ---
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // --- 🍅 포모도로 타이머 State (동적 동기화 구현) ---
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerMode, setTimerMode] = useState(() => {
    return localStorage.getItem('lumora_timer_mode') || 'focus';
  });
  const [isTimerRunning, setIsTimerRunning] = useState(() => {
    return localStorage.getItem('lumora_timer_running') === 'true';
  });
  const [isTimerPinned, setIsTimerPinned] = useState(() => {
    return localStorage.getItem('lumora_timer_pinned') !== 'false';
  });
  const [timerTargetTime, setTimerTargetTime] = useState(() => {
    return Number(localStorage.getItem('lumora_timer_target_time')) || 0;
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    const running = localStorage.getItem('lumora_timer_running') === 'true';
    if (running) {
      const target = Number(localStorage.getItem('lumora_timer_target_time')) || 0;
      return Math.max(0, Math.ceil((target - Date.now()) / 1000));
    } else {
      const savedTime = localStorage.getItem('lumora_timer_time_left');
      if (savedTime !== null) return Number(savedTime);
      const focus = Number(localStorage.getItem('lumora_focus_duration')) || 25;
      return focus * 60;
    }
  });

  // --- 창 제목(Document Title) 업데이트 ---
  const [boardTitle, setBoardTitle] = useState(() => localStorage.getItem('lumora_title') || defaultTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // ✨ Pop-out Window State
  const [popoutCategoryId, setPopoutCategoryId] = useState(() => {
    return new URLSearchParams(window.location.search).get('popout');
  });
  const [poppedOutCategories, setPoppedOutCategories] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lumora_popped_out')) || [];
    } catch { return []; }
  });
  const [pinnedCategories, setPinnedCategories] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lumora_pinned_categories')) || [];
    } catch { return []; }
  });

  const poppedCategory = popoutCategoryId ? categories.find(c => String(c.id) === String(popoutCategoryId)) : null;
  const poppedCategoryColor = poppedCategory ? (CATEGORY_HUES[poppedCategory.colorTheme] || '#FBCFE8') : null;

  // ✨ Mini Mode Detection (< 450px)
  const [isMiniMode, setIsMiniMode] = useState(window.innerWidth < 450);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // ✨ Menu Toggle State

  // --- Firebase Authentication State Observer ---
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        isGuestModeRef.current = false;
        setUser(firebaseUser);
      } else {
        // 🛡️ 게스트 모드 중이면 데이터 초기화 방지 (race condition 방어)
        if (isGuestModeRef.current) {
          setAuthLoading(false);
          return;
        }
        setUser(null);
        // Reset states on logout
        setTasks([]);
        setCategories([]);
        setIsInitialLoadComplete(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (mockUser) => {
    if (mockUser) {
      // 게스트 모드 ref 설정
      if (mockUser.uid === 'guest_user') {
        isGuestModeRef.current = true;
      }
      setUser(mockUser);
    }
    setIsAuthModalOpen(false);
  };

  // --- Load User Data from Firestore ---
  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      setIsInitialLoadComplete(false);
      try {
        console.log("Loading user data from Firestore for UID:", user.uid);

        let savedTheme = localStorage.getItem('lumora_theme') || 'developer';
        let savedTitle = defaultTitle;
        let savedFocus = 25;
        let savedBreak = 5;
        let savedFontSize = 14;
        let savedFontFamily = 'default';
        let savedFilterMode = 'all';
        let savedFilterDate = getLocalDateString();
        let savedPoppedOut = [];
        let savedPinned = [];

        if (user.uid !== "guest_user") {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            savedTheme = data.currentTheme || savedTheme;
            savedTitle = data.projectTitle || savedTitle;
            savedFocus = data.focusDuration || savedFocus;
            savedBreak = data.breakDuration || savedBreak;
            savedFontSize = data.fontSize || savedFontSize;
            savedFontFamily = data.fontFamily || savedFontFamily;
            savedFilterMode = data.filterMode || savedFilterMode;
            savedFilterDate = data.filterDate || savedFilterDate;
            savedPoppedOut = data.poppedOutCategories || savedPoppedOut;
            savedPinned = data.pinnedCategories || savedPinned;
          }
        } else {
          // If Guest user, use localStorage or defaults
          savedTheme = localStorage.getItem('lumora_theme') || 'developer';
          savedTitle = localStorage.getItem('lumora_title') || defaultTitle;
          savedFocus = parseInt(localStorage.getItem('lumora_focus_duration')) || 25;
          savedBreak = parseInt(localStorage.getItem('lumora_break_duration')) || 5;
          savedFontSize = parseInt(localStorage.getItem('lumora_font_size')) || 14;
          savedFontFamily = localStorage.getItem('lumora_font_family') || 'default';
          savedFilterMode = localStorage.getItem('lumora_filter_mode') || 'all';
          savedFilterDate = localStorage.getItem('lumora_filter_date') || getLocalDateString();
          try { savedPoppedOut = JSON.parse(localStorage.getItem('lumora_popped_out')) || []; } catch(e) {}
          try { savedPinned = JSON.parse(localStorage.getItem('lumora_pinned_categories')) || []; } catch(e) {}
        }

        // Apply settings states
        setCurrentTheme(savedTheme);
        setProjectTitle(savedTitle);
        setBoardTitle(savedTitle);
        setFocusDuration(savedFocus);
        setBreakDuration(savedBreak);
        setFontSize(savedFontSize);
        setFontFamily(savedFontFamily);
        setFilterMode(savedFilterMode);
        setFilterDate(savedFilterDate);
        setPoppedOutCategories(savedPoppedOut);
        setPinnedCategories(savedPinned);

        // 2. Load Categories
        let loadedCategories = [];
        if (user.uid !== "guest_user") {
          const catQuery = query(collection(db, 'categories'), where('userId', '==', user.uid));
          const catSnapshot = await getDocs(catQuery);
          catSnapshot.forEach((doc) => {
            loadedCategories.push({ ...doc.data(), id: doc.id });
          });
        } else {
          try {
            const saved = localStorage.getItem('lumora_categories');
            loadedCategories = saved ? JSON.parse(saved) : defaultCategories;
          } catch(e) { loadedCategories = defaultCategories; }
        }

        if (loadedCategories.length === 0) {
          loadedCategories = defaultCategories;
          if (user.uid !== "guest_user") {
            loadedCategories.forEach(async (cat) => {
              await setDoc(doc(db, 'categories', cat.id), { ...cat, userId: user.uid });
            });
          }
        }
        setCategories(loadedCategories);

        // 3. Load Tasks
        let loadedTasks = [];
        if (user.uid !== "guest_user") {
          const taskQuery = query(collection(db, 'tasks'), where('userId', '==', user.uid));
          const taskSnapshot = await getDocs(taskQuery);
          taskSnapshot.forEach((doc) => {
            loadedTasks.push({ ...doc.data(), id: isNaN(doc.id) ? doc.id : Number(doc.id) });
          });
        } else {
          try {
            const saved = localStorage.getItem('lumora_tasks');
            loadedTasks = saved ? JSON.parse(saved) : defaultTasks;
          } catch(e) { loadedTasks = defaultTasks; }
        }

        if (loadedTasks.length === 0 && loadedCategories.length === defaultCategories.length) {
          loadedTasks = defaultTasks;
          if (user.uid !== "guest_user") {
            loadedTasks.forEach(async (task) => {
              await setDoc(doc(db, 'tasks', String(task.id)), { ...task, userId: user.uid });
            });
          }
        }
        setTasks(loadedTasks);

        console.log("Initial load complete from Firestore");
      } catch (err) {
        console.error("Failed to load user data:", err);
        // 🛡️ 게스트 모드에서 오류 발생 시 기본 데이터 보장 (빈 화면 방지)
        if (user.uid === "guest_user") {
          try {
            const savedCats = localStorage.getItem('lumora_categories');
            const savedTasks = localStorage.getItem('lumora_tasks');
            setCategories(savedCats ? JSON.parse(savedCats) : defaultCategories);
            setTasks(savedTasks ? JSON.parse(savedTasks) : defaultTasks);
          } catch (e) {
            setCategories(defaultCategories);
            setTasks(defaultTasks);
          }
        }
      } finally {
        setIsInitialLoadComplete(true);
      }
    };

    loadUserData();
  }, [user]);

  // --- Firestore Diff-and-Sync for Tasks ---
  const prevTasksRef = useRef([]);
  useEffect(() => {
    if (!user || user.uid === "guest_user" || !isInitialLoadComplete) {
      prevTasksRef.current = tasks;
      return;
    }

    const prevTasks = prevTasksRef.current;
    const added = tasks.filter(t => !prevTasks.some(p => p.id === t.id));
    const deleted = prevTasks.filter(p => !tasks.some(t => t.id === p.id));
    const updated = tasks.filter(t => {
      const prev = prevTasks.find(p => p.id === t.id);
      return prev && JSON.stringify(prev) !== JSON.stringify(t);
    });

    added.forEach(async (t) => {
      await setDoc(doc(db, 'tasks', String(t.id)), { ...t, userId: user.uid });
    });

    updated.forEach(async (t) => {
      await setDoc(doc(db, 'tasks', String(t.id)), { ...t, userId: user.uid });
    });

    deleted.forEach(async (t) => {
      await deleteDoc(doc(db, 'tasks', String(t.id)));
    });

    prevTasksRef.current = tasks;
  }, [tasks, user, isInitialLoadComplete]);

  // --- Firestore Diff-and-Sync for Categories ---
  const prevCategoriesRef = useRef([]);
  useEffect(() => {
    if (!user || user.uid === "guest_user" || !isInitialLoadComplete) {
      prevCategoriesRef.current = categories;
      return;
    }

    const prevCategories = prevCategoriesRef.current;
    const added = categories.filter(c => !prevCategories.some(p => p.id === c.id));
    const deleted = prevCategories.filter(p => !categories.some(c => c.id === p.id));
    const updated = categories.filter(c => {
      const prev = prevCategories.find(p => p.id === c.id);
      return prev && JSON.stringify(prev) !== JSON.stringify(c);
    });

    added.forEach(async (c) => {
      await setDoc(doc(db, 'categories', String(c.id)), { ...c, userId: user.uid });
    });

    updated.forEach(async (c) => {
      await setDoc(doc(db, 'categories', String(c.id)), { ...c, userId: user.uid });
    });

    deleted.forEach(async (c) => {
      await deleteDoc(doc(db, 'categories', String(c.id)));
    });

    prevCategoriesRef.current = categories;
  }, [categories, user, isInitialLoadComplete]);

  // --- Firestore Settings Save ---
  useEffect(() => {
    if (!user || user.uid === "guest_user" || !isInitialLoadComplete) return;

    const saveSettings = async () => {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          projectTitle,
          focusDuration,
          breakDuration,
          fontSize,
          fontFamily,
          currentTheme,
          poppedOutCategories,
          pinnedCategories,
          filterMode,
          filterDate
        }, { merge: true });
      } catch (err) {
        console.error("Failed to save settings to Firestore:", err);
      }
    };

    const timer = setTimeout(saveSettings, 300);
    return () => clearTimeout(timer);
  }, [
    user,
    isInitialLoadComplete,
    projectTitle,
    focusDuration,
    breakDuration,
    fontSize,
    fontFamily,
    currentTheme,
    poppedOutCategories,
    pinnedCategories,
    filterMode,
    filterDate
  ]);

  // --- 데이터 자동 저장 (최적화: 개별 감지 및 즉각 저장) ---
  useEffect(() => {
    const val = JSON.stringify(categories);
    if (localStorage.getItem('lumora_categories') !== val) {
      localStorage.setItem('lumora_categories', val);
    }
  }, [categories]);

  useEffect(() => {
    const val = JSON.stringify(tasks);
    if (localStorage.getItem('lumora_tasks') !== val) {
      localStorage.setItem('lumora_tasks', val);
    }
  }, [tasks]);

  useEffect(() => {
    if (localStorage.getItem('lumora_title') !== projectTitle) {
      localStorage.setItem('lumora_title', projectTitle);
    }
  }, [projectTitle]);

  useEffect(() => {
    if (Number(localStorage.getItem('lumora_focus_duration')) !== focusDuration) {
      localStorage.setItem('lumora_focus_duration', String(focusDuration));
    }
  }, [focusDuration]);

  useEffect(() => {
    if (Number(localStorage.getItem('lumora_break_duration')) !== breakDuration) {
      localStorage.setItem('lumora_break_duration', String(breakDuration));
    }
  }, [breakDuration]);

  useEffect(() => {
    if (Number(localStorage.getItem('lumora_font_size')) !== fontSize) {
      localStorage.setItem('lumora_font_size', String(fontSize));
    }
  }, [fontSize]);

  useEffect(() => {
    if (localStorage.getItem('lumora_font_family') !== fontFamily) {
      localStorage.setItem('lumora_font_family', fontFamily);
    }
  }, [fontFamily]);

  useEffect(() => {
    if (localStorage.getItem('lumora_theme') !== currentTheme) {
      localStorage.setItem('lumora_theme', currentTheme);
    }
  }, [currentTheme]);

  useEffect(() => {
    const val = JSON.stringify(poppedOutCategories);
    if (localStorage.getItem('lumora_popped_out') !== val) {
      localStorage.setItem('lumora_popped_out', val);
    }
  }, [poppedOutCategories]);

  useEffect(() => {
    const val = JSON.stringify(pinnedCategories);
    if (localStorage.getItem('lumora_pinned_categories') !== val) {
      localStorage.setItem('lumora_pinned_categories', val);
    }
  }, [pinnedCategories]);

  useEffect(() => {
    if (localStorage.getItem('lumora_filter_mode') !== filterMode) {
      localStorage.setItem('lumora_filter_mode', filterMode);
    }
  }, [filterMode]);

  useEffect(() => {
    if (localStorage.getItem('lumora_filter_date') !== filterDate) {
      localStorage.setItem('lumora_filter_date', filterDate);
    }
  }, [filterDate]);

  // ✨ Storage Event Listener and IPC listener for Cross-Window Sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'lumora_tasks') {
        try { setTasks(JSON.parse(e.newValue) || []); } catch (err) {}
      } else if (e.key === 'lumora_categories') {
        try { setCategories(JSON.parse(e.newValue) || []); } catch (err) {}
      } else if (e.key === 'lumora_popped_out') {
        try { setPoppedOutCategories(JSON.parse(e.newValue) || []); } catch (err) {}
      } else if (e.key === 'lumora_pinned_categories') {
        try { setPinnedCategories(JSON.parse(e.newValue) || []); } catch (err) {}
      } else if (e.key === 'lumora_theme') {
        if (e.newValue) setCurrentTheme(e.newValue);
      } else if (e.key === 'lumora_font_size') {
        if (e.newValue) setFontSize(Number(e.newValue));
      } else if (e.key === 'lumora_font_family') {
        if (e.newValue) setFontFamily(e.newValue);
      } else if (e.key === 'lumora_filter_mode') {
        if (e.newValue) setFilterMode(e.newValue);
      } else if (e.key === 'lumora_filter_date') {
        if (e.newValue) setFilterDate(e.newValue);
      } else if (e.key === 'lumora_timer_mode') {
        if (e.newValue) setTimerMode(e.newValue);
      } else if (e.key === 'lumora_timer_running') {
        setIsTimerRunning(e.newValue === 'true');
      } else if (e.key === 'lumora_timer_target_time') {
        setTimerTargetTime(Number(e.newValue) || 0);
      } else if (e.key === 'lumora_timer_time_left') {
        setTimeLeft(Number(e.newValue) || 0);
      } else if (e.key === 'lumora_timer_pinned') {
        setIsTimerPinned(e.newValue !== 'false');
      } else if (e.key === 'lumora_focus_duration') {
        if (e.newValue) setFocusDuration(Number(e.newValue) || 25);
      } else if (e.key === 'lumora_break_duration') {
        if (e.newValue) setBreakDuration(Number(e.newValue) || 5);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // ✨ Register IPC popout-closed listener
    let ipc = null;
    try {
      if (window.require) {
        ipc = window.require('electron').ipcRenderer;
      } else if (window.electron && window.electron.ipcRenderer) {
        ipc = window.electron.ipcRenderer;
      }
    } catch (e) {}

    const handlePopoutClosed = (event, closedId) => {
      setPoppedOutCategories(prev => {
        const updated = prev.filter(id => id !== closedId);
        localStorage.setItem('lumora_popped_out', JSON.stringify(updated));
        return updated;
      });
    };

    if (ipc) {
      ipc.on('popout-closed', handlePopoutClosed);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (ipc) {
        ipc.removeListener('popout-closed', handlePopoutClosed);
      }
    };
  }, []);

  // --- 🔔 시스템 알림 권한 요청 ---
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // --- 📖 로그인/게스트 접속 후 최초 1회만 온보딩 설명서 자동 팝업 ---
  useEffect(() => {
    // 팝아웃 창이거나, 유저 미로그인이거나, 초기 데이터 로드 미완료 시 실행 안 함
    if (popoutCategoryId || !user || !isInitialLoadComplete) return;

    const onboardingCompleted = localStorage.getItem('lumora_onboarding_completed') === 'true';
    if (!onboardingCompleted) {
      const timer = setTimeout(() => {
        sendIPC('open-popout', 'onboarding');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [user, isInitialLoadComplete, popoutCategoryId]);

  // --- ⏱️ 타이머 항상 위에 고정 상태 변경 핸들러 ---
  useEffect(() => {
    localStorage.setItem('lumora_timer_pinned', isTimerPinned ? 'true' : 'false');
    if (popoutCategoryId === 'timer') {
      sendIPC('set-always-on-top', { categoryId: 'timer', isPinned: isTimerPinned });
    }
  }, [isTimerPinned, popoutCategoryId]);

  // --- 📌 카테고리 항상 위에 고정 상태 변경 핸들러 ---
  useEffect(() => {
    localStorage.setItem('lumora_pinned_categories', JSON.stringify(pinnedCategories));
    if (popoutCategoryId && popoutCategoryId !== 'timer' && popoutCategoryId !== 'onboarding') {
      const isPinned = pinnedCategories.includes(Number(popoutCategoryId)) || pinnedCategories.includes(popoutCategoryId) || pinnedCategories.includes(String(popoutCategoryId));
      sendIPC('set-always-on-top', { categoryId: popoutCategoryId, isPinned });
    }
  }, [pinnedCategories, popoutCategoryId]);

  useEffect(() => {
    if (categories.length > 0 && !categories.find(c => c.id === selectedCategoryId)) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // ✨ Auto-resize popout window based on content ONCE when opened
  // The user explicitly requested to NOT auto-resize afterwards to prevent jitter ("드르륵")
  // and allow them to freely resize it manually.
  useEffect(() => {
    // Reset the ref whenever the popout state changes
    lastCalculatedHeightRef.current = null;
    
    if (!popoutCategoryId) return;
    
    const updateSize = () => {
      // If we already set the initial size, do NOT run again!
      if (lastCalculatedHeightRef.current !== null) return;
      
      if (popoutCategoryId === 'timer') {
        const targetWidth = 280;
        const targetHeight = 115;
        lastCalculatedHeightRef.current = targetHeight;
        sendIPC('resize-popout-window', { categoryId: 'timer', width: targetWidth, height: targetHeight });
        setTimeout(() => {
          sendIPC('show-popout-window', { categoryId: 'timer' });
        }, 50);
        return;
      }

      if (popoutCategoryId === 'onboarding') {
        const targetWidth = 340;
        const targetHeight = 480;
        lastCalculatedHeightRef.current = targetHeight;
        sendIPC('resize-popout-window', { categoryId: 'onboarding', width: targetWidth, height: targetHeight });
        setTimeout(() => {
          sendIPC('show-popout-window', { categoryId: 'onboarding' });
        }, 50);
        return;
      }
      
      const wrapper = document.getElementById('popout-content-wrapper');
      if (!wrapper) return;
      
      const headerEl = wrapper.firstElementChild;
      const listEl = wrapper.querySelector('.custom-scrollbar');
      if (!headerEl || !listEl) return;

      const headerHeight = headerEl.offsetHeight;
      let trueListHeight = 0;
      const validChildren = Array.from(listEl.children).filter(el => el.offsetHeight > 0);
      if (validChildren.length > 0) {
          const first = validChildren[0];
          const last = validChildren[validChildren.length - 1];
          trueListHeight = last.getBoundingClientRect().bottom - first.getBoundingClientRect().top;
          trueListHeight += 16; // Add container padding buffer
      } else {
          trueListHeight = 60; // Minimum height for empty list
      }      
      let quickAddHeight = 0;
      const lastEl = wrapper.lastElementChild;
      if (lastEl && lastEl !== listEl && lastEl !== headerEl) {
         quickAddHeight = lastEl.offsetHeight;
      }
      
      let buffer = 16;
      if (currentTheme === 'developer') {
        buffer = 24;
      } else if (currentTheme === 'princess') {
        buffer = 36;
      } else if (currentTheme === 'excel') {
        buffer = 24;
      }
      
      const naturalHeight = Math.round(headerHeight + trueListHeight + quickAddHeight + buffer);
      const targetHeight = Math.min(naturalHeight, 640);
      const targetWidth = Math.round(window.innerWidth);
      
      // Mark that we have set the size once!
      lastCalculatedHeightRef.current = targetHeight;
      sendIPC('resize-popout-window', { categoryId: popoutCategoryId, width: targetWidth, height: targetHeight });
      
      // Delay slightly to ensure the window has been resized before making it visible
      setTimeout(() => {
          sendIPC('show-popout-window', { categoryId: popoutCategoryId });
      }, 50);
    };

    // We only want to run this exactly ONCE after the content has rendered.
    // We completely removed ResizeObserver because it was causing severe jitter ("드르륵")
    // and random resizing when the user was just scrolling or interacting with the window.
    const timeoutId = setTimeout(() => {
      updateSize();
    }, 200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [popoutCategoryId]);

  // 설정 변경 시 타이머 리셋 반영
  useEffect(() => {
    const prev = prevDurationsRef.current;
    const durationsChanged = prev.focus !== focusDuration || prev.break !== breakDuration;

    if (!isTimerRunning && durationsChanged) {
      const seconds = timerMode === 'focus' ? focusDuration * 60 : breakDuration * 60;
      setTimeLeft(seconds);
      localStorage.setItem('lumora_timer_time_left', String(seconds));
      // Notify other windows of the time left update
      window.dispatchEvent(new Event('storage'));
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
            new Notification('Code Tiara', {
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




  // --- 타이머 로직 (동기화 기반) ---
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      const updateTime = () => {
        const target = Number(localStorage.getItem('lumora_timer_target_time')) || timerTargetTime;
        const remaining = Math.max(0, Math.ceil((target - Date.now()) / 1000));
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          setIsTimerRunning(false);
          localStorage.setItem('lumora_timer_running', 'false');
          
          const notifiedTimestamp = Number(localStorage.getItem('lumora_timer_notified_timestamp')) || 0;
          if (Math.abs(target - notifiedTimestamp) > 5000) {
            localStorage.setItem('lumora_timer_notified_timestamp', String(target));
            
            const mode = localStorage.getItem('lumora_timer_mode') || timerMode;
            const title = mode === 'focus' ? '집중 시간 끝!' : '휴식 시간 끝!';
            const msg = mode === 'focus' ? '수고했어! 이제 좀 쉬자.' : '자, 다시 집중해볼까?';
            setNotifications(prev => [{
              id: Date.now(),
              title,
              message: msg,
              time: formatTimeDisplay(`${new Date().getHours()}:${new Date().getMinutes()}`),
              read: false
            }, ...prev]);

            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification('Code Tiara', {
                body: msg,
                silent: false
              });
            }
          }
        }
      };
      
      updateTime();
      interval = setInterval(updateTime, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerTargetTime, timerMode]);

  const toggleTimer = () => {
    const newRunning = !isTimerRunning;
    setIsTimerRunning(newRunning);
    localStorage.setItem('lumora_timer_running', String(newRunning));
    
    if (newRunning) {
      const target = Date.now() + timeLeft * 1000;
      setTimerTargetTime(target);
      localStorage.setItem('lumora_timer_target_time', String(target));
    } else {
      localStorage.setItem('lumora_timer_time_left', String(timeLeft));
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    localStorage.setItem('lumora_timer_running', 'false');
    const duration = timerMode === 'focus' ? focusDuration : breakDuration;
    const seconds = duration * 60;
    setTimeLeft(seconds);
    localStorage.setItem('lumora_timer_time_left', String(seconds));
  };

  const switchTimerMode = () => {
    const newMode = timerMode === 'focus' ? 'break' : 'focus';
    setTimerMode(newMode);
    localStorage.setItem('lumora_timer_mode', newMode);
    
    const duration = newMode === 'focus' ? focusDuration : breakDuration;
    const seconds = duration * 60;
    setTimeLeft(seconds);
    localStorage.setItem('lumora_timer_time_left', String(seconds));
    
    setIsTimerRunning(false);
    localStorage.setItem('lumora_timer_running', 'false');
  };

  const handleTimerPopout = () => {
    if (popoutCategoryId === 'timer') {
      const updated = poppedOutCategories.filter(id => id !== 'timer');
      setPoppedOutCategories(updated);
      localStorage.setItem('lumora_popped_out', JSON.stringify(updated));
      sendIPC('close-popout-by-id', 'timer');
    } else {
      if (!poppedOutCategories.includes('timer')) {
        const updated = [...poppedOutCategories, 'timer'];
        setPoppedOutCategories(updated);
        localStorage.setItem('lumora_popped_out', JSON.stringify(updated));
      }
      sendIPC('open-popout', 'timer');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- Actions: Tasks ---
  const addTask = (e, forcedCatId = null) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    if (categories.length === 0) return;

    const finalDueTime = convertTo24Hour(taskHour, taskMinute, taskAmpm);

    const targetCategoryId = forcedCatId || selectedCategoryId;

    const newTask = {
      id: Date.now(),
      text: newTaskText,
      categoryId: targetCategoryId,
      completed: false,
      dueDate: taskDate, // ✨ 날짜 저장
      dueTime: finalDueTime,
      alerted: false,
      recurrence: taskRecurrence, // ✨ 반복
      recurrenceInterval: taskRecurrenceInterval,
      recurrenceDays: taskRecurrenceDays,
      memo: newTaskMemo // ✨ 상세 메모 저장
    };
    
    setTasks(prevTasks => {
      const catTasks = prevTasks.filter(t => t.categoryId === targetCategoryId);
      const incompleteTasks = catTasks.filter(t => !t.completed);
      const completedTasks = catTasks.filter(t => t.completed);
      const sortedCatTasks = [...incompleteTasks, newTask, ...completedTasks];

      let finalTasks = [];
      categories.forEach(cat => {
        if (cat.id === targetCategoryId) {
          finalTasks.push(...sortedCatTasks);
        } else {
          finalTasks.push(...prevTasks.filter(t => t.categoryId === cat.id));
        }
      });
      return finalTasks;
    });

    setNewTaskText('');
    setNewTaskMemo(''); // ✨ 초기화
    setTaskDate(''); // ✨ 초기화
    setTaskHour('');
    setTaskMinute('');
    setTaskAmpm('오전');
    setTaskRecurrence('none');
    setTaskRecurrenceInterval(1);
    setTaskRecurrenceDays([]);

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

  // ✨ Date Navigation Helpers
  const shiftFilterDate = (direction) => {
    const d = parseLocalDate(filterDate);
    const amount = direction === 'next' ? 1 : -1;
    if (filterMode === 'daily') d.setDate(d.getDate() + amount);
    else if (filterMode === 'weekly') d.setDate(d.getDate() + (amount * 7));
    else if (filterMode === 'monthly') d.setMonth(d.getMonth() + amount);
    setFilterDate(getLocalDateString(d));
  };

  const getFilterDisplayString = () => {
    const d = parseLocalDate(filterDate);
    if (filterMode === 'daily') {
      const isToday = filterDate === getLocalDateString();
      return isToday ? '오늘' : `${d.getMonth() + 1}월 ${d.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][d.getDay()]})`;
    }
    if (filterMode === 'weekly') {
      const day = d.getDay();
      const start = new Date(d);
      start.setDate(d.getDate() - day);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.getMonth() + 1}.${start.getDate()} ~ ${end.getMonth() + 1}.${end.getDate()}`;
    }
    if (filterMode === 'monthly') {
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
    }
    return '';
  };

  const checkRecurrenceMatch = (startDate, checkDate, type, interval, days) => {
    if (checkDate < startDate) return false;
    const msPerDay = 1000 * 60 * 60 * 24;
    
    if (type === 'daily') return true;
    if (type === 'weekly') {
      const activeDays = (days && days.length > 0) ? days : [startDate.getDay()];
      return activeDays.includes(checkDate.getDay());
    }
    if (type === 'monthly') {
      const checkLastDayOfMonth = new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0).getDate();
      const targetDay = startDate.getDate();
      if (checkDate.getDate() === targetDay) return true;
      if (targetDay > checkLastDayOfMonth && checkDate.getDate() === checkLastDayOfMonth) return true;
      return false;
    }
    if (type === 'custom') {
      const diffTime = checkDate.getTime() - startDate.getTime();
      const diffDays = Math.round(diffTime / msPerDay);
      return diffDays % (interval || 1) === 0;
    }
    return false;
  };

  const isTaskMatchingDateFilter = (task) => {
    if (filterMode === 'all') return true;
    
    if (!task.dueDate && (!task.recurrence || task.recurrence === 'none')) return false;

    const baseDateStr = task.dueDate || getLocalDateString();
    const tDate = parseLocalDate(baseDateStr);
    tDate.setHours(0, 0, 0, 0);
    const refDate = parseLocalDate(filterDate);
    refDate.setHours(0, 0, 0, 0);

    let checkStart = new Date(refDate);
    let checkEnd = new Date(refDate);
    
    if (filterMode === 'daily') {
      // same day
    } else if (filterMode === 'weekly') {
      const day = refDate.getDay();
      checkStart.setDate(refDate.getDate() - day);
      checkEnd = new Date(checkStart);
      checkEnd.setDate(checkStart.getDate() + 6);
    } else if (filterMode === 'monthly') {
      checkStart.setDate(1);
      checkEnd = new Date(checkStart.getFullYear(), checkStart.getMonth() + 1, 0);
    }

    checkStart.setHours(0,0,0,0);
    checkEnd.setHours(23,59,59,999);

    if (!task.recurrence || task.recurrence === 'none') {
      return tDate >= checkStart && tDate <= checkEnd;
    }

    if (checkEnd < tDate) return false;

    let currentCheckDate = new Date(checkStart < tDate ? tDate : checkStart);
    currentCheckDate.setHours(0,0,0,0);

    while (currentCheckDate <= checkEnd) {
      if (checkRecurrenceMatch(tDate, currentCheckDate, task.recurrence, task.recurrenceInterval, task.recurrenceDays)) {
        return true;
      }
      currentCheckDate.setDate(currentCheckDate.getDate() + 1);
    }
    
    return false;
  };

  const getRecurrenceHint = (dateStr, type) => {
    if (type !== 'monthly') return '';
    const d = parseLocalDate(dateStr || getLocalDateString());
    if (type === 'monthly') return `(매월 ${d.getDate()}일)`;
    return '';
  };

  const renderDayPicker = (currentDays, setDays, referenceDateStr) => {
    const daysArr = ['일', '월', '화', '수', '목', '금', '토'];
    const defaultDay = parseLocalDate(referenceDateStr || getLocalDateString()).getDay();
    const activeDays = (currentDays && currentDays.length > 0) ? currentDays : [defaultDay];

    const toggleDay = (idx) => {
      if (activeDays.includes(idx)) {
        if (activeDays.length === 1) return;
        setDays(activeDays.filter(d => d !== idx));
      } else {
        setDays([...activeDays, idx].sort());
      }
    };

    return (
      <div className="flex gap-0.5 ml-2">
        {daysArr.map((dayLabel, idx) => {
          const isActive = activeDays.includes(idx);
          let btnClass = '';
          if (currentTheme === 'princess') {
            btnClass = isActive ? 'bg-[var(--c-dark)] text-white shadow-sm' : 'bg-white text-[var(--c-dark)] border border-[var(--c-light)] opacity-70';
          } else if (currentTheme === 'excel') {
            btnClass = isActive ? 'bg-[#107C41] text-white border border-[#107C41]' : 'bg-[#F3F2F1] text-slate-500 border border-[#D1D1D1]';
          } else {
            btnClass = isActive ? 'bg-[#007ACC] text-white' : 'bg-[#2D2D30] text-[#ABB2BF] border border-[#3E3E42]';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => toggleDay(idx)}
              className={`w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-bold transition-all ${btnClass}`}
            >
              {dayLabel}
            </button>
          );
        })}
      </div>
    );
  };

  // --- 계산 로직 (필터 적용된 할 일 기준) ---
  const filteredTotalTasks = tasks.filter(isTaskMatchingDateFilter);
  const totalTasks = filteredTotalTasks.length;
  const completedTasks = filteredTotalTasks.filter(t => t.completed).length;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const calculateNextRecurrence = (dateStr, type, interval, days) => {
    if (!dateStr) {
      dateStr = getLocalDateString();
    }
    const date = parseLocalDate(dateStr);
    if (type === 'daily') {
      date.setDate(date.getDate() + 1);
    } else if (type === 'weekly') {
      if (days && days.length > 0) {
        let count = 0;
        do {
          date.setDate(date.getDate() + 1);
          count++;
        } while (!days.includes(date.getDay()) && count < 8);
      } else {
        date.setDate(date.getDate() + 7);
      }
    } else if (type === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else if (type === 'custom') {
      date.setDate(date.getDate() + parseInt(interval || 1, 10));
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const toggleTask = (id) => {
    setTasks(prevTasks => {
      const taskToToggle = prevTasks.find(t => t.id === id);
      if (!taskToToggle) return prevTasks;
      
      let newTasks = [...prevTasks];
      const updatedTask = { ...taskToToggle, completed: !taskToToggle.completed };
      
      // ✨ 반복 할 일이 완료되었을 때 복제
      if (updatedTask.completed && taskToToggle.recurrence && taskToToggle.recurrence !== 'none') {
        const nextDate = calculateNextRecurrence(taskToToggle.dueDate, taskToToggle.recurrence, taskToToggle.recurrenceInterval, taskToToggle.recurrenceDays);
        const clonedTask = {
          ...taskToToggle,
          id: Date.now() + Math.random(),
          dueDate: nextDate,
          completed: false, // Ensure clone is not completed
          alerted: false
        };
        newTasks.push(clonedTask);
      }
      
      newTasks = newTasks.map(t => t.id === id ? updatedTask : t);
      
      const categoryId = taskToToggle.categoryId;
      const catTasks = newTasks.filter(t => t.categoryId === categoryId);
      
      const incompleteTasks = catTasks.filter(t => !t.completed);
      const completedTasks = catTasks.filter(t => t.completed);
      const sortedCatTasks = [...incompleteTasks, ...completedTasks];
      
      let finalTasks = [];
      categories.forEach(cat => {
        if (cat.id === categoryId) {
          finalTasks.push(...sortedCatTasks);
        } else {
          finalTasks.push(...newTasks.filter(t => t.categoryId === cat.id));
        }
      });
      
      return finalTasks;
    });
  };

  const duplicateTask = (task) => {
    const newTask = {
      ...task,
      id: Date.now() + Math.random(),
      text: `${task.text} (복사본)`,
      alerted: false
    };

    setTasks(prevTasks => {
      const targetCategoryId = task.categoryId;
      const catTasks = prevTasks.filter(t => t.categoryId === targetCategoryId);
      const originalIndex = catTasks.findIndex(t => t.id === task.id);
      
      const newCatTasks = [...catTasks];
      if (originalIndex !== -1) {
        newCatTasks.splice(originalIndex + 1, 0, newTask);
      } else {
        newCatTasks.push(newTask);
      }
      
      const incompleteTasks = newCatTasks.filter(t => !t.completed);
      const completedTasks = newCatTasks.filter(t => t.completed);
      const sortedCatTasks = [...incompleteTasks, ...completedTasks];

      let finalTasks = [];
      categories.forEach(cat => {
        if (cat.id === targetCategoryId) {
          finalTasks.push(...sortedCatTasks);
        } else {
          finalTasks.push(...prevTasks.filter(t => t.categoryId === cat.id));
        }
      });
      return finalTasks;
    });
  };

  // --- Actions: Edit Task ---
  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
    setEditingMemo(task.memo || ''); // ✨ 메모 로드
    setEditingDate(task.dueDate || ''); // ✨ 날짜 로드
    setEditingRecurrence(task.recurrence || 'none');
    setEditingRecurrenceInterval(task.recurrenceInterval || 1);
    setEditingRecurrenceDays(task.recurrenceDays || []);
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
    setEditingMemo(''); // ✨ 초기화
    setEditingDate(''); // ✨ 초기화
    setEditingHour('');
    setEditingMinute('');
    setEditingAmpm('오전');
    setEditingRecurrence('none');
    setEditingRecurrenceInterval(1);
    setEditingRecurrenceDays([]);
  };

  const saveEditing = (id) => {
    if (!editingText.trim()) return;

    // 시간 저장 로직
    const finalDueTime = convertTo24Hour(editingHour, editingMinute, editingAmpm);

    setTasks(tasks.map(t => t.id === id ? {
      ...t,
      text: editingText,
      memo: editingMemo, // ✨ 메모 저장
      dueDate: editingDate, // ✨ 날짜 저장
      dueTime: finalDueTime,
      alerted: false, // 시간 수정 시 알림 리셋
      recurrence: editingRecurrence,
      recurrenceInterval: editingRecurrenceInterval,
      recurrenceDays: editingRecurrenceDays
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

  const [miniModeAdderId, setMiniModeAdderId] = useState(null); // ✨ Quick Add State
  const miniModeFormRef = useRef(null); // ✨ Ref for Quick Add Form
  const editFormRef = useRef(null); // ✨ Ref for Edit Task Form
  const notifRef = useRef(null); // ✨ Ref for Notifications

  // ✨ Helper function to trigger popout window resizing based on content height
  const triggerPopoutResize = useCallback(() => {
    if (!popoutCategoryId || popoutCategoryId === 'timer' || popoutCategoryId === 'onboarding') return;
    if (lastCalculatedHeightRef.current === null) return;

    const wrapper = document.getElementById('popout-content-wrapper');
    if (!wrapper) return;

    const headerEl = wrapper.firstElementChild;
    const listEl = wrapper.querySelector('.custom-scrollbar');
    if (!headerEl || !listEl) return;

    const headerHeight = headerEl.offsetHeight;
    let trueListHeight = 0;
    const validChildren = Array.from(listEl.children).filter(el => el.offsetHeight > 0);
    if (validChildren.length > 0) {
        const first = validChildren[0];
        const last = validChildren[validChildren.length - 1];
        trueListHeight = last.getBoundingClientRect().bottom - first.getBoundingClientRect().top;
        trueListHeight += 16; // Add container padding buffer
    } else {
        trueListHeight = 60; // Minimum height for empty list
    }

    let quickAddHeight = 0;
    const isFormActive = miniModeAdderId && String(miniModeAdderId) === String(popoutCategoryId);
    if (isFormActive) {
      const lastEl = wrapper.lastElementChild;
      if (lastEl && lastEl !== listEl && lastEl !== headerEl) {
        quickAddHeight = lastEl.scrollHeight || lastEl.offsetHeight;
      }
    }

    let buffer = 16;
    if (currentTheme === 'developer') {
      buffer = isFormActive ? 42 : 24;
    } else if (currentTheme === 'princess') {
      buffer = isFormActive ? 40 : 36;
    } else if (currentTheme === 'excel') {
      buffer = isFormActive ? 36 : 24;
    }

    const naturalHeight = Math.round(headerHeight + trueListHeight + quickAddHeight + buffer);
    const targetHeight = Math.min(naturalHeight, isFormActive ? 680 : 640);
    const targetWidth = Math.round(window.innerWidth);

    lastCalculatedHeightRef.current = targetHeight;
    sendIPC('resize-popout-window', { categoryId: popoutCategoryId, width: targetWidth, height: targetHeight });
  }, [popoutCategoryId, miniModeAdderId, currentTheme]);

  // ✨ Auto-resize popout window when Quick Add Form toggles or Task Edit toggles
  useEffect(() => {
    if (!popoutCategoryId || popoutCategoryId === 'timer' || popoutCategoryId === 'onboarding') return;
    if (lastCalculatedHeightRef.current === null) return;

    // Delay slightly to allow React to update the DOM classes
    const timeoutId = setTimeout(() => {
      triggerPopoutResize();
    }, 80);

    return () => clearTimeout(timeoutId);
  }, [miniModeAdderId, popoutCategoryId, editingTaskId, triggerPopoutResize]);

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

  const menuRef = useRef(null);

  // ✨ Click Outside for Menu
  useEffect(() => {
    const handleClickOutsideMenu = (e) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(e.target) && !e.target.closest('button[title="메뉴"]')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideMenu);
    return () => document.removeEventListener('mousedown', handleClickOutsideMenu);
  }, [isMenuOpen]);

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
    a.download = `dashboard_backup_${getLocalDateString()}.json`;
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
      case 'gift': return <Gift className={className} />;
      case 'calendar': return <Calendar className={className} />;
      default: return <Terminal className={className} />;
    }
  };

  // ✨ Safe IPC Call wrapper
  const sendIPC = (channel, ...args) => {
    try {
      if (window.require) {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send(channel, ...args);
      } else if (window.electron && window.electron.ipcRenderer) {
        window.electron.ipcRenderer.send(channel, ...args);
      } else {
        console.error('Electron IPC not available');
      }
    } catch (e) { console.error('IPC Error', e); }
  };

  if (authLoading) {
    const loaderTheme = THEME_CONFIG[currentTheme] || THEME_CONFIG.developer;
    return (
      <div className={`h-screen w-screen flex flex-col items-center justify-center ${loaderTheme.root} font-mono`}>
        <div className="text-center space-y-4">
          <div className={`w-8 h-8 border-4 border-dashed rounded-full animate-spin ${currentTheme === 'princess' ? 'border-[#FF6B81]' : (currentTheme === 'excel' ? 'border-[#107C41]' : 'border-[#61AFEF]')}`}></div>
          <div className="text-xs opacity-75">AUTHENTICATING...</div>
        </div>
      </div>
    );
  }

  // ✨ 팝아웃 창이면 인증 체크 건너뜀 (사용 설명서, 카테고리 팝아웃 등)
  if (!user && !popoutCategoryId) {
    return (
      <AuthScreen 
        currentTheme={currentTheme} 
        onAuthSuccess={handleAuthSuccess} 
        onThemeChange={setCurrentTheme}
      />
    );
  }

  return (
      <div
        className={`h-screen w-screen flex flex-col overflow-hidden transition-colors duration-500 ${popoutCategoryId ? 'bg-transparent' : `${theme.radius} ${theme.root}`}`}
        style={{
          border: popoutCategoryId ? 'none' : `2px solid ${theme.windowBorder || 'transparent'}`,
          backgroundColor: popoutCategoryId ? 'transparent' : undefined
        }}
      >
      {/* Custom Scrollbar Styles injected here 
      */}
      <style>{`
        /* 글로벌 사용자 폰트 패밀리 지정 (폰트 미리보기 아이템 및 그 자식들은 예외 처리) */
        ${fontFamily !== 'default' ? `
          body, 
          body *:not(.font-preview-item):not(.font-preview-item *), 
          input:not(.font-preview-item), 
          select:not(.font-preview-item), 
          textarea:not(.font-preview-item), 
          button:not(.font-preview-item) {
            font-family: '${fontFamily}', sans-serif !important;
          }
        ` : ''}

        /* 특정 폰트(동글, 개구, 나눔손글씨 펜, 감자꽃)에 대한 전체 Tailwind font-size 스케일 보정 (개별 테이퍼링 적용) */
        ${( ['Dongle', 'Gaegu', 'Nanum Pen Script', 'Gamja Flower'].includes(fontFamily) || (fontFamily === 'default' && currentTheme === 'princess') ) ? (() => {
          const actualFont = fontFamily === 'default' && currentTheme === 'princess' ? 'Gamja Flower' : fontFamily;
          const getScaleForClass = (cls) => getFontScaleMultiplier(actualFont, currentTheme, cls);
          return `
            .text-xs:not(.font-preview-item):not(.font-preview-item *) { font-size: calc(0.75rem * ${getScaleForClass('text-xs')}); }
            .text-sm:not(.font-preview-item):not(.font-preview-item *) { font-size: calc(0.875rem * ${getScaleForClass('text-sm')}); }
            .text-base:not(.font-preview-item):not(.font-preview-item *) { font-size: calc(1rem * ${getScaleForClass('text-base')}); }
            .text-lg:not(.font-preview-item):not(.font-preview-item *) { font-size: calc(1.125rem * ${getScaleForClass('text-lg')}); }
            .text-xl:not(.font-preview-item):not(.font-preview-item *) { font-size: calc(1.25rem * ${getScaleForClass('text-xl')}); }
            .text-2xl:not(.font-preview-item):not(.font-preview-item *) { font-size: calc(1.5rem * ${getScaleForClass('text-2xl')}); }
            .text-3xl:not(.font-preview-item):not(.font-preview-item *) { font-size: calc(1.875rem * ${getScaleForClass('text-3xl')}); }
            .text-4xl:not(.font-preview-item):not(.font-preview-item *) { font-size: calc(2.25rem * ${getScaleForClass('text-4xl')}); }
            .text-\\[10px\\]:not(.font-preview-item):not(.font-preview-item *) { font-size: calc(10px * ${getScaleForClass('text-[10px]')}); }
            .text-\\[11px\\]:not(.font-preview-item):not(.font-preview-item *) { font-size: calc(11px * ${getScaleForClass('text-[11px]')}); }
          `;
        })() : ''}

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
          background-color: ${
            popoutCategoryId && currentTheme === 'princess' && poppedCategoryColor
              ? hexToRgba(poppedCategoryColor, 0.65)
              : theme.scrollbar.thumb
          } !important;
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
          background: ${
            popoutCategoryId && currentTheme === 'princess' && poppedCategoryColor
              ? poppedCategoryColor
              : theme.scrollbar.thumbHover
          } !important;
        }
        /* Firefox 지원 */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${
            popoutCategoryId && currentTheme === 'princess' && poppedCategoryColor
              ? hexToRgba(poppedCategoryColor, 0.65)
              : theme.scrollbar.thumb
          } transparent;
        }
      `}</style>

      {/* ✨ Custom Title Bar (Fixed at Top) */}
      {/* ✨ Custom Title Bar Removed */}

      {/* Size Change: Full Window Mode & No Limits */}
      <div className={`${popoutCategoryId ? 'h-full flex flex-col' : `${cardClassName} h-full`}`}>
        {popoutCategoryId === 'timer' ? (
          <div 
            className={`h-screen w-screen flex flex-col overflow-hidden transition-all duration-500 p-2
              ${currentTheme === 'princess' 
                ? 'bg-gradient-to-tr from-[#FFF5F7] to-[#FFF0F3] border-2 border-[#FFC0CB] rounded-3xl shadow-[0_8px_24px_rgba(255,182,193,0.35)]' 
                : currentTheme === 'excel'
                  ? 'bg-[#F3F2F1] border-2 border-[#0E6032] rounded-none shadow-md'
                  : 'bg-[#181A1F] border border-[#282C34] rounded-lg shadow-[0_12px_24px_rgba(0,0,0,0.5)]'
              }`}
            style={{ WebkitAppRegion: 'drag' }}
          >
            {/* Header dragging area & Controls */}
            <div className={`flex items-center justify-between shrink-0 mb-1 px-1.5 pt-1`} style={{ WebkitAppRegion: 'drag' }}>
              <span className={`text-[10px] font-bold select-none flex items-center gap-1.5
                ${currentTheme === 'princess' 
                  ? 'text-[#FF6B81] font-gamja' 
                  : currentTheme === 'excel' 
                    ? 'text-[#217346] font-sans' 
                    : 'text-[#ABB2BF] font-mono'
                }`}
              >
                {currentTheme === 'princess' ? (
                  <>🎀 포커스 타이머</>
                ) : currentTheme === 'excel' ? (
                  <>📊 FOCUS TIMER (Sheet1)</>
                ) : (
                  <><span className="text-[#98C379]">&gt;_</span> FOCUS_TIMER.sh</>
                )}
              </span>
              <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
                {/* 📌 Pin/Unpin Toggle Button */}
                <button
                  onClick={() => setIsTimerPinned(!isTimerPinned)}
                  className={`p-1 transition-colors cursor-pointer flex items-center justify-center
                    ${currentTheme === 'princess'
                      ? 'rounded-full text-slate-400 hover:text-[#FF6B81] hover:bg-white/60'
                      : currentTheme === 'excel'
                        ? 'rounded-none text-slate-600 hover:bg-[#D1D5DB]'
                        : 'rounded text-slate-400 hover:text-[#61AFEF] hover:bg-[#282C34]'
                    }`}
                  title={isTimerPinned ? "고정 해제" : "항상 위에 고정"}
                >
                  {isTimerPinned ? (
                    <Pin className={`w-3.5 h-3.5 ${currentTheme === 'princess' ? 'text-[#FF6B81]' : currentTheme === 'excel' ? 'text-[#107C41]' : 'text-[#61AFEF]'}`} />
                  ) : (
                    <PinOff className="w-3.5 h-3.5 opacity-60" />
                  )}
                </button>
                <button 
                  onClick={() => {
                    const updated = poppedOutCategories.filter(id => id !== 'timer');
                    setPoppedOutCategories(updated);
                    localStorage.setItem('lumora_popped_out', JSON.stringify(updated));
                    sendIPC('close-popout-by-id', 'timer');
                  }}
                  className={`p-1 transition-colors cursor-pointer flex items-center justify-center
                    ${currentTheme === 'princess' 
                      ? 'rounded-full text-slate-400 hover:text-[#FF6B81] hover:bg-white/60' 
                      : currentTheme === 'excel'
                        ? 'rounded-none text-slate-600 hover:bg-[#D1D5DB]'
                        : 'rounded text-slate-400 hover:text-[#E06C75] hover:bg-[#282C34]'
                    }`}
                  title="메인 화면으로 복귀"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            {/* Timer Display & Main Controls */}
            <div className={`flex-1 flex items-center justify-between px-3 border select-none
              ${currentTheme === 'princess' 
                ? 'bg-white/85 border-[1.5px] border-dashed border-[#FFC0CB] rounded-2xl shadow-inner' 
                : currentTheme === 'excel'
                  ? 'bg-white border border-[#D1D1D1] rounded-none'
                  : 'bg-[#21252B] border border-[#282C34] rounded-md shadow-inner'
              }`} style={{ WebkitAppRegion: 'no-drag' }}>
              {/* Mode Tag */}
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold transition-all
                ${currentTheme === 'developer'
                  ? (timerMode === 'focus' ? 'text-[#E06C75] bg-[#E06C75]/10 border border-[#E06C75]/20 font-mono uppercase tracking-wider' : 'text-[#98C379] bg-[#98C379]/10 border border-[#98C379]/20 font-mono uppercase tracking-wider')
                  : currentTheme === 'princess'
                    ? (timerMode === 'focus' ? 'bg-[#FF6B81] text-white rounded-full px-2 shadow-sm font-gamja' : 'bg-[#FFEBEF] text-[#FF6B81] border border-[#FFCCD5] rounded-full px-2 shadow-sm font-gamja')
                    : (timerMode === 'focus' ? 'bg-[#E6F2EA] text-[#107C41] border border-[#107C41]' : 'bg-[#F3F2F1] text-[#333333] border border-[#D1D5DB]')
                }`}>
                {timerMode === 'focus' ? '🔥 집중' : '☕ 휴식'}
              </div>

              {/* Time */}
              <div className={`text-3xl tabular-nums tracking-widest leading-none font-bold
                ${currentTheme === 'princess' 
                  ? `${timerMode === 'focus' ? 'text-[#FF6B81]' : 'text-[#FF8DA1]'} font-gamja font-black` 
                  : currentTheme === 'excel' 
                    ? 'text-[#333333] font-sans' 
                    : (timerMode === 'focus' 
                        ? 'text-[#E06C75] font-mono drop-shadow-[0_0_6px_rgba(224,108,117,0.4)]' 
                        : 'text-[#98C379] font-mono drop-shadow-[0_0_6px_rgba(152,195,121,0.4)]'
                      )
                }`}
              >
                {formatTime(timeLeft)}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={switchTimerMode} 
                  className={`p-1 transition-colors flex items-center justify-center
                    ${currentTheme === 'developer' 
                      ? 'text-[#ABB2BF] hover:text-[#61AFEF] hover:bg-[#2C313A] border border-[#3E4451] rounded' 
                      : currentTheme === 'princess' 
                        ? 'text-[#FFB6C1] hover:text-[#FF6B81] hover:bg-[#FFF0F3] border border-[#FFE4E1] rounded-full' 
                        : 'text-slate-600 hover:text-black hover:bg-[#F3F2F1] border border-[#D1D5DB] rounded-none'
                    }`} 
                  title="모드 전환"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={toggleTimer} 
                  className={`p-1.5 transition-all flex items-center justify-center hover:scale-105 active:scale-95
                    ${currentTheme === 'princess' 
                      ? 'text-white bg-gradient-to-r from-[#FF6B81] to-[#FF8DA1] hover:from-[#FF5271] hover:to-[#FF6B81] shadow-[0_3px_8px_rgba(255,107,129,0.3)] rounded-full' 
                      : currentTheme === 'excel' 
                        ? 'text-white bg-[#107C41] hover:bg-[#0E6032] border border-[#107C41] rounded-none' 
                        : 'text-[#21252B] bg-[#61AFEF] border border-[#61AFEF] hover:bg-[#4d97ff] hover:border-[#4d97ff] hover:shadow-[0_0_8px_rgba(97,175,239,0.5)] rounded'
                    }`}
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ) : popoutCategoryId === 'onboarding' ? (
          <OnboardingPanel
            currentTheme={currentTheme}
            theme={theme}
            onClose={() => sendIPC('close-popout-by-id', 'onboarding')}
          />
        ) : (
          <>

        {/* Terminal Header Bar */}
        {!popoutCategoryId && (
        <div className={`${theme.header.bg} px-3 h-10 flex items-center justify-between ${theme.header.border} border-b relative z-[999] shrink-0 select-none`} style={{ WebkitAppRegion: 'drag', transform: 'translateZ(0)' }}>
          {/* Left: Window Controls */}
          <div className="flex gap-1.5 z-10" style={{ WebkitAppRegion: 'no-drag' }}>
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

          {/* Center: Title (Display Only - Drag Friendly) */}
          <div className={`flex-1 flex justify-center text-[10px] ${currentTheme === 'excel' ? 'text-white' : theme.header.text} font-bold px-4 pointer-events-none`}>
            <div className={`${isMiniMode ? 'flex' : 'hidden min-[220px]:flex'} items-center gap-1`}>
              <span 
                className={`truncate max-w-[150px] sm:max-w-[200px] ${currentTheme === 'princess' ? 'text-sm font-bold tracking-tight text-[#FF6B81]' : (theme.header.text + ' uppercase tracking-widest')}`}
              >
                {currentTheme === 'princess' && projectTitle === defaultTitle ? <>나의 다이어리 <span className="text-xs">🎀</span></> : projectTitle}
              </span>
            </div>
          </div>

          {/* Right: Icons Group */}
          <div className="flex gap-1.5 items-center z-10" style={{ WebkitAppRegion: 'no-drag' }}>
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
                    {/* Menu Card */}
                    <div ref={menuRef} className="absolute right-0 top-8 w-40 bg-white border-2 border-[#FFC0CB] rounded-[15px] shadow-[0_10px_20px_rgba(255,182,193,0.3)] z-50 overflow-hidden text-slate-600 flex flex-col animate-in fade-in zoom-in-95 duration-200">
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
                    <div ref={menuRef} className={`absolute right-0 top-8 w-40 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200
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
                          className={`px-3 py-2 text-xs font-bold text-left flex items-center gap-2 transition-colors ${theme.dropdown.itemInactive}`}
                        >
                          <span className={theme.iconType === 'table' ? "opacity-100" : ""}>{isMiniMode ? '🖥️' : '📱'}</span> {isMiniMode ? '전체 모드' : '미니 모드'}
                        </button>
                        <button
                          onClick={() => { setIsTimerOpen(!isTimerOpen); setIsMenuOpen(false); }}
                          className={`px-3 py-2 text-xs font-bold text-left flex items-center gap-2 transition-colors ${theme.dropdown.itemInactive}`}
                        >
                          <span className={theme.iconType === 'table' ? "opacity-100" : ""}>⏱️</span> 타이머
                        </button>
                        <button
                          onClick={() => { setIsClearConfirmOpen(true); setIsMenuOpen(false); }}
                          className={`px-3 py-2 text-xs font-bold text-left flex items-center gap-2 transition-colors ${theme.dropdown.itemInactive}`}
                        >
                          <span className={theme.iconType === 'table' ? "opacity-100" : ""}>🧹</span> 완료 항목 정리
                        </button>
                        <div className={`h-px mx-2 my-0.5 ${currentTheme === 'princess' ? 'bg-pink-100' : (currentTheme === 'excel' ? 'bg-[#E1E1E1]' : 'bg-current opacity-10')}`}></div>
                        <button
                          onClick={() => { setIsSettingsOpen(true); setIsMenuOpen(false); }}
                          className={`px-3 py-2 text-xs font-bold text-left flex items-center gap-2 transition-colors ${theme.dropdown.itemInactive}`}
                        >
                          <span className={theme.iconType === 'table' ? "opacity-100" : ""}>🔧</span> 전체 설정
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {/* Notification Dropdown (Compact) with Custom Scrollbar */}

            {/* Notification Dropdown (Compact) with Custom Scrollbar */}
            {isNotifOpen && (
              <div ref={notifRef} className={`absolute z-50 overflow-hidden animate-in slide-in-from-top-2 
                ${currentTheme === 'princess' ? 'top-10 right-4 w-64 max-w-[calc(100vw-2rem)]' : (currentTheme === 'developer' ? 'right-2 top-8 w-64 max-w-[calc(100vw-1rem)]' : 'right-2 top-7 w-64 max-w-[calc(100vw-1rem)]')} 
                ${theme.notification.container}`}>
                {/* 🎀 Princess Arrow */}
                {currentTheme === 'princess' && <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white border-t-2 border-l-2 border-[#FFC0CB] rotate-45"></div>}

                <div className={`px-3 py-2 flex justify-between items-center ${theme.notification.header}`}>
                  <span className={`font-bold opacity-70 ${currentTheme === 'excel' ? 'text-xs font-sans' : (currentTheme === 'developer' ? 'text-[10px] font-mono tracking-wider' : 'text-xs font-gamja')}`}>
                    {currentTheme === 'developer' ? '// ACTIVE_ALERTS.log' : (currentTheme === 'princess' ? '🎀 새 소식' : '알림 내역')} ({unreadCount})
                  </span>
                  {unreadCount > 0 && (
                    <button onClick={clearAllNotifications} className={`text-xs font-medium underline underline-offset-2 px-2 py-0.5 rounded transition-colors ${theme.notification.clearBtn}`}>
                      {currentTheme === 'developer' ? 'clear()' : (currentTheme === 'princess' ? '모두 지우기' : '모두 삭제')}
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {unreadCount === 0 ? (
                    <p className={`p-4 text-center text-sm opacity-60 ${currentTheme === 'princess' ? 'text-[#F472B6] font-gamja font-bold' : 'text-inherit'}`}>알림이 없습니다 {currentTheme === 'princess' ? '🎀' : ''}</p>
                  ) : (
                    notifications.map(n => {
                      if (currentTheme === 'developer') {
                        return (
                          <div key={n.id} className="p-2.5 border-b border-[#3E3E42] hover:bg-[#2C313C]/35 flex gap-2 items-start group transition-colors">
                            <span className="text-[#98C379] mt-0.5 text-xs select-none">{'>'}</span>
                            <div className="flex-1 font-mono text-[11px] leading-relaxed">
                              <span className="text-[#5C6370]">{n.time}</span>{' '}
                              <span className="text-[#61AFEF] font-bold">{n.title}</span>
                              <p className="text-[#ABB2BF] mt-0.5 pl-3 border-l border-[#3E3E42]">{n.message}</p>
                            </div>
                            <button onClick={() => clearNotification(n.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-[#5C6370] hover:text-[#E06C75]">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      }
                      if (currentTheme === 'princess') {
                        const isBreakNotif = n.title.includes('휴식');
                        return (
                          <div key={n.id} className="p-3 border-b border-[#FFC0CB]/30 border-dashed hover:bg-[#FFF5F8]/50 flex gap-2.5 items-start group transition-colors">
                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ring-4 shadow-sm animate-pulse
                              ${isBreakNotif ? 'bg-[#FF8DA1] ring-[#FFD1DC]' : 'bg-[#FF6B81] ring-[#FFD1DC]'}`}></div>
                            <div className="flex-1 font-gamja text-sm space-y-0.5">
                              <p className={`font-black tracking-wide flex items-center gap-1.5 ${isBreakNotif ? 'text-[#FF8DA1]' : 'text-[#FF6B81]'}`}>
                                {n.title}
                                <span className="text-[10px] text-pink-400 font-normal">{n.time}</span>
                              </p>
                              <p className="text-slate-600 font-bold text-xs">{n.message} 🧁</p>
                            </div>
                            <button onClick={() => clearNotification(n.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-pink-300 hover:text-[#FF6B81]">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      }
                      // Excel & Generic
                      return (
                        <div key={n.id} className="p-2.5 border-b border-[#E1E1E1] hover:bg-[#F3F2F1] flex gap-2.5 items-start group transition-colors">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-none shrink-0 bg-[#107C41]"></div>
                          <div className="flex-1 font-sans text-xs">
                            <p className="font-bold text-[#107C41]">{n.title} <span className="text-[10px] text-slate-500 font-normal ml-1">{n.time}</span></p>
                            <p className="text-[#333333] mt-0.5">{n.message}</p>
                          </div>
                          <button onClick={() => clearNotification(n.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-red-600">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>


        </div>
        )}

        {/* --- 🍅 POMODORO TIMER OVERLAY (Compact) --- */}


        {/* --- SETTINGS MODE (Compact) with Custom Scrollbar --- */}
        {isSettingsOpen ? (
          <SettingsPanel
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            currentTheme={currentTheme}
            setCurrentTheme={setCurrentTheme}
            theme={theme}
            projectTitle={projectTitle}
            setProjectTitle={setProjectTitle}
            defaultTitle={defaultTitle}
            focusDuration={focusDuration}
            setFocusDuration={setFocusDuration}
            breakDuration={breakDuration}
            setBreakDuration={setBreakDuration}
            fontSize={fontSize}
            setFontSize={setFontSize}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            categories={categories}
            onDragEndCategories={onDragEndCategories}
            activePicker={activePicker}
            setActivePicker={setActivePicker}
            updateCategory={updateCategory}
            addCategory={addCategory}
            confirmingCategoryDeleteId={confirmingCategoryDeleteId}
            setConfirmingCategoryDeleteId={setConfirmingCategoryDeleteId}
            finalDeleteCategory={finalDeleteCategory}
            categoryToDelete={categoryToDelete}
            setCategoryToDelete={setCategoryToDelete}
            confirmDeleteCategory={confirmDeleteCategory}
            exportData={exportData}
            triggerImport={triggerImport}
            fileInputRef={fileInputRef}
            importData={importData}
            handleResetRequest={handleResetRequest}
            isResetConfirming={isResetConfirming}
            getIcon={getIcon}
            openOnboardingGuide={() => sendIPC('open-popout', 'onboarding')}
            user={user}
            onSignOut={() => signOut(auth)}
            onLoginClick={() => {
              setIsAuthModalOpen(true);
              setIsSettingsOpen(false);
            }}
          />


        ) : (
          /* --- DASHBOARD MODE (Compact) with Custom Scrollbar --- */
          <>
            {/* ✨ Fixed Status Header (Integrated Timer) - Shows in Mini Mode ONLY if Timer is Active */}
            {!popoutCategoryId && (!isMiniMode || isTimerOpen) && (
              <div className={`shrink-0 transition-all min-h-[58px] flex flex-col justify-center ${currentTheme === 'princess' ? 'bg-white px-6 py-2 border-b border-[#FFC0CB]/30' : 'px-4 pt-4 pb-2 border-b border-slate-800/50'}`}>

                {isTimerOpen ? (
                  poppedOutCategories.includes('timer') ? (
                    /* ⏱️ Popped Out Timer Placeholder */
                    <div className="flex items-center justify-between w-full gap-2 animate-in fade-in slide-in-from-top-1 duration-300 select-none min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 select-none ${currentTheme === 'princess' ? 'bg-[#FF6B81]/10 text-[#FF6B81]' : (currentTheme === 'excel' ? 'bg-[#107C41]/10 text-[#107C41]' : 'bg-[#E5C07B]/10 text-[#E5C07B]')}`}>
                          POPOUT
                        </span>
                        <span className={`text-xs whitespace-nowrap truncate ${currentTheme === 'princess' ? 'text-[#FF6B81]' : 'text-slate-400'}`}>
                          ⏱️ 타이머 분리됨
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          const updated = poppedOutCategories.filter(id => id !== 'timer');
                          setPoppedOutCategories(updated);
                          localStorage.setItem('lumora_popped_out', JSON.stringify(updated));
                          sendIPC('close-popout-by-id', 'timer');
                        }}
                        className={`text-xs px-2.5 py-1 whitespace-nowrap shrink-0 transition-colors font-bold ${currentTheme === 'princess' ? 'bg-[#FF6B81]/15 text-[#FF6B81] hover:bg-[#FF6B81]/25 rounded-full' : (currentTheme === 'excel' ? 'bg-[#107C41]/15 text-[#107C41] hover:bg-[#107C41]/25 rounded-none border border-[#107C41]/30' : 'bg-[#61AFEF]/15 text-[#61AFEF] hover:bg-[#61AFEF]/25 rounded')}`}
                      >
                        다시 부르기
                      </button>
                    </div>
                  ) : (
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
                            <button onClick={handleTimerPopout} className="p-1.5 hover:bg-[#E1E1E1] text-slate-600 transition-colors border-r border-[#E1E1E1]" title="팝업으로 분리">
                              <PanelTopOpen className="w-3.5 h-3.5" />
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
                                : (currentTheme === 'princess' ? 'bg-[#FFB6C1]/10 text-[#FF6B81] border border-[#FFB6C1]/20' : 'bg-green-500 text-white')
                              )
                            }`}>
                            {currentTheme === 'developer'
                              ? (timerMode === 'focus' ? '> FOCUS' : '> REST')
                              : (timerMode === 'focus' ? '🔥 집중' : '☕ 휴식')
                            }
                          </div>

                          <div className={`text-2xl tabular-nums tracking-widest ${currentTheme === 'princess' ? `${timerMode === 'focus' ? 'text-[#FF6B81]' : 'text-[#FF8DA1]'} font-gamja font-medium` : 'text-slate-200 font-mono font-bold'}`}>
                            {formatTime(timeLeft)}
                          </div>

                          <div className="flex items-center gap-2">
                            <button onClick={switchTimerMode} className={`p-1 rounded-full text-slate-500 hover:bg-black/5 transition-colors ${currentTheme === 'developer' ? 'text-[#ABB2BF] hover:bg-[#3E3E42]' : (currentTheme === 'princess' ? 'text-[#FF6B81] hover:bg-[#FF6B81]/10' : '')}`} title="모드 전환">
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={toggleTimer} className={`p-2 rounded-full transition-transform hover:scale-110 ${currentTheme === 'princess' ? `${timerMode === 'focus' ? 'bg-[#FF6B81]/10 text-[#FF6B81] hover:bg-[#FF6B81]/20' : 'bg-[#FFB6C1]/10 text-[#FF6B81] hover:bg-[#FFB6C1]/20'}` : (currentTheme === 'developer' ? 'text-[#ABB2BF] hover:text-white' : 'bg-slate-700 text-slate-200')}`}>
                              {isTimerRunning ? <Pause className="w-4 h-4 ml-px" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                            <button onClick={handleTimerPopout} className={`p-1 rounded-full text-slate-500 hover:bg-black/5 transition-colors ${currentTheme === 'developer' ? 'text-[#ABB2BF] hover:bg-[#3E3E42]' : (currentTheme === 'princess' ? 'text-[#FF6B81] hover:bg-[#FF6B81]/10' : '')}`} title="팝업으로 분리">
                              <PanelTopOpen className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setIsTimerOpen(false)} className={`p-1 rounded-full text-slate-500 hover:bg-black/5 transition-colors ${currentTheme === 'developer' ? 'text-[#ABB2BF] hover:bg-[#3E3E42]' : (currentTheme === 'princess' ? 'text-slate-400' : '')}`}>
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )
                ) : (
                  /* ✨ Default: Date & Progress or Excel Formula Bar */
                  currentTheme === 'excel' ? (
                    /* 📊 Excel Formula Bar Style */
                    <div className="flex flex-wrap items-center gap-1.5 px-1 py-1 bg-[#F3F2F1] border-b border-[#E1E1E1] text-[11px] font-sans text-[#444]">
                      <div className="font-serif italic text-slate-500 font-bold px-1 shrink-0">fx</div>
                      
                      {/* Date Filter Integrated into Formula Bar */}
                      <div className="flex items-center gap-1 bg-white border border-[#D1D5DB] px-1 h-[22px] shadow-sm inset-shadow shrink-0">
                        <CustomDatePicker
                          value={filterDate}
                          onChange={(e) => {
                            if (e.target.value) {
                              setFilterDate(e.target.value);
                              setFilterMode('daily');
                            }
                          }}
                          currentTheme={currentTheme}
                          customTrigger={<Calendar className="w-3 h-3 text-[#217346] hover:scale-110 cursor-pointer transition-transform" />}
                        />
                        <select
                          value={filterMode}
                          onChange={(e) => {
                            setFilterMode(e.target.value);
                            setFilterDate(getLocalDateString());
                          }}
                          className="bg-transparent outline-none cursor-pointer border-none font-bold text-slate-600"
                          title="기간 필터"
                        >
                          <option value="all" className="bg-white text-slate-800">전체 날짜</option>
                          <option value="daily" className="bg-white text-slate-800">일간</option>
                          <option value="weekly" className="bg-white text-slate-800">주간</option>
                          <option value="monthly" className="bg-white text-slate-800">월간</option>
                        </select>
                        {filterMode !== 'all' && (
                          <div className="flex items-center gap-0.5 ml-0.5 pl-1 border-l border-[#E1E1E1]">
                            <button onClick={() => shiftFilterDate('prev')} className="hover:bg-slate-100 p-0.5 rounded"><ChevronLeft className="w-3 h-3" /></button>
                            <span className="min-w-[50px] text-center font-medium">{getFilterDisplayString()}</span>
                            <button onClick={() => shiftFilterDate('next')} className="hover:bg-slate-100 p-0.5 rounded"><ChevronRight className="w-3 h-3" /></button>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 bg-white border border-[#D1D5DB] px-2 py-0.5 text-slate-700 h-[22px] flex items-center gap-2 shadow-sm inset-shadow min-w-max">
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
                        {/* Left: Date Navigation Filter */}
                        <div className={`flex items-center gap-1 text-[11px] font-bold ${currentTheme === 'princess' ? 'text-[#FF6B81]' : 'text-slate-500'}`}>
                          <CustomDatePicker
                            value={filterDate}
                            onChange={(e) => {
                              if (e.target.value) {
                                setFilterDate(e.target.value);
                                setFilterMode('daily');
                              }
                            }}
                            currentTheme={currentTheme}
                            customTrigger={<Calendar className="w-3 h-3 hover:scale-110 cursor-pointer transition-transform" />}
                          />
                          <select
                            value={filterMode}
                            onChange={(e) => {
                              setFilterMode(e.target.value);
                              setFilterDate(getLocalDateString());
                            }}
                            className={`outline-none cursor-pointer ${currentTheme === 'developer' ? 'bg-[#1E1E1E] text-[#ABB2BF]' : 'bg-transparent'}`}
                            title="보기 모드"
                          >
                            <option value="all" className={currentTheme === 'developer' ? 'bg-[#252526] text-[#D4D4D4]' : (currentTheme === 'princess' ? 'bg-white text-[#FF6B81] font-bold' : 'bg-white text-slate-800')}>전체 날짜</option>
                            <option value="daily" className={currentTheme === 'developer' ? 'bg-[#252526] text-[#D4D4D4]' : (currentTheme === 'princess' ? 'bg-white text-[#FF6B81] font-bold' : 'bg-white text-slate-800')}>일간</option>
                            <option value="weekly" className={currentTheme === 'developer' ? 'bg-[#252526] text-[#D4D4D4]' : (currentTheme === 'princess' ? 'bg-white text-[#FF6B81] font-bold' : 'bg-white text-slate-800')}>주간</option>
                            <option value="monthly" className={currentTheme === 'developer' ? 'bg-[#252526] text-[#D4D4D4]' : (currentTheme === 'princess' ? 'bg-white text-[#FF6B81] font-bold' : 'bg-white text-slate-800')}>월간</option>
                          </select>
                          
                          {filterMode !== 'all' && (
                            <div className="flex items-center gap-0.5 ml-1">
                              <button onClick={() => shiftFilterDate('prev')} className={`p-0.5 rounded transition-colors hover:scale-110 active:scale-95 ${currentTheme === 'princess' ? 'hover:bg-[#FFC0CB]/30' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}><ChevronLeft className="w-3 h-3" /></button>
                              <span className="min-w-[50px] text-center">{getFilterDisplayString()}</span>
                              <button onClick={() => shiftFilterDate('next')} className={`p-0.5 rounded transition-colors hover:scale-110 active:scale-95 ${currentTheme === 'princess' ? 'hover:bg-[#FFC0CB]/30' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}><ChevronRight className="w-3 h-3" /></button>
                            </div>
                          )}
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

            <div className={`flex-1 flex flex-col ${popoutCategoryId ? 'overflow-hidden p-0' : 'overflow-y-auto custom-scrollbar ' + (currentTheme === 'princess' ? (isMiniMode ? 'p-1' : 'px-6 py-4') : 'p-3 sm:p-4')}`}>

              {/* Input Form (Compact) - ✨ HIDDEN IN MINI MODE */}
              {/* ✨ Main Add Task UI - Hidden for themes that have category-specific adders */}
              {!popoutCategoryId && !isMiniMode && !['princess', 'excel', 'developer'].includes(currentTheme) && (
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

                        {/* ✨ Recurrence Picker */}
                        <div className={`flex items-center gap-1 ${currentTheme === 'princess' ? 'bg-transparent' : ''}`}>
                          <select
                            value={taskRecurrence}
                            onChange={(e) => setTaskRecurrence(e.target.value)}
                            className={`outline-none bg-transparent cursor-pointer text-xs ${currentTheme === 'princess' ? 'text-[#FF6B81] font-bold' : (currentTheme === 'excel' ? 'bg-white border border-[#D1D5DB] h-8 px-1' : 'text-slate-400')}`}
                            title="반복 설정"
                          >
                            <option value="none">🔁 반복 안함</option>
                            <option value="daily">🔁 매일</option>
                            <option value="weekly">🔁 매주</option>
                            <option value="monthly">🔁 매월</option>
                            <option value="custom">🔁 N일마다</option>
                          </select>
                          {taskRecurrence === 'custom' && (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                value={taskRecurrenceInterval}
                                onChange={(e) => setTaskRecurrenceInterval(e.target.value)}
                                className={`w-10 text-center outline-none bg-transparent text-xs ${currentTheme === 'princess' ? 'border-b border-[#FF6B81] text-[#FF6B81] font-bold' : (currentTheme === 'excel' ? 'bg-white border border-[#D1D5DB] h-8' : 'border-b border-slate-500 text-slate-300')}`}
                              />
                              <span className={`text-[10px] ${currentTheme === 'princess' ? 'text-pink-300 font-bold' : 'text-slate-500'}`}>일마다</span>
                            </div>
                          )}
                        </div>
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
                          <button type="button" onClick={() => setTaskAmpm(prev => prev === '오전' ? '오후' : '오전')} className={`ml-1 px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors ${currentTheme === 'princess' ? (taskAmpm === '오전' ? 'bg-[#FF6B81] text-white' : 'bg-[#FF8DA1] text-white') : (currentTheme === 'excel' ? (taskAmpm === '오전' ? 'bg-[#217346] text-white' : 'bg-[#E2F0D9] text-[#217346]') : 'bg-slate-200 text-slate-600')}`}>
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
              {/* Task Lists */}
              <DragDropContext onDragEnd={onDragEnd}>
                <div className={popoutCategoryId ? "flex-1 flex flex-col" : "space-y-3 flex-1"}>
                  {(popoutCategoryId ? categories.filter(c => c.id === popoutCategoryId) : categories).map(category => {
                    const isPoppedOut = !popoutCategoryId && poppedOutCategories.includes(category.id);
                    const categoryTasks = tasks.filter(t => t.categoryId === category.id && isTaskMatchingDateFilter(t));
                    const colorStyles = getThemeStyles(category.colorTheme);

                    // Constants moved to top of file
                    const categoryColor = CATEGORY_HUES[category.colorTheme] || '#FBCFE8';
                    const borderIdle = hexToRgba(categoryColor, 0.6); // Weak border (60% opacity)
                    const borderHover = categoryColor; // Full color on hover

                    const headerBg = currentTheme === 'princess'
                      ? hexToRgba(categoryColor, 0.45)
                      : undefined;

                    if (isPoppedOut) {
                      const restoreCategory = () => {
                        const updated = poppedOutCategories.filter(id => id !== category.id);
                        setPoppedOutCategories(updated);
                        localStorage.setItem('lumora_popped_out', JSON.stringify(updated));
                        sendIPC('close-popout-by-id', category.id);
                      };

                      if (currentTheme === 'developer') {
                        return (
                          <div key={category.id} className="flex items-center justify-between p-3 mb-4 bg-[#1E1E1E] border border-dashed border-[#3E3E42] opacity-80">
                            <div className="flex items-center gap-2 font-mono">
                              {getIcon(category.icon, `w-4 h-4 text-[#5C6370]`)}
                              <span className="text-[#5C6370] text-sm">{`// ${category.label} is running in external window...`}</span>
                            </div>
                            <button
                                onClick={restoreCategory}
                                className="px-3 py-1 bg-[#282C34] border border-[#3E3E42] text-[#ABB2BF] hover:bg-[#3E4451] hover:text-white transition-colors text-xs font-mono"
                            >
                              [RETURN]
                            </button>
                          </div>
                        );
                      }
                      
                      if (currentTheme === 'excel') {
                        return (
                          <div key={category.id} className="flex items-center justify-between p-2 mb-2 bg-[#F3F2F1] border border-dashed border-[#D1D1D1] opacity-80">
                            <div className="flex items-center gap-2 font-sans">
                              {getIcon(category.icon, `w-4 h-4 text-[#666]`)}
                              <span className="text-[#666] text-xs font-bold uppercase">[{category.label}] - EXTERNAL LINK</span>
                            </div>
                            <button
                                onClick={restoreCategory}
                                className="px-3 py-1 bg-white border border-[#D1D1D1] text-[#333] hover:bg-[#E1E1E1] transition-colors text-xs font-sans"
                            >
                              Restore
                            </button>
                          </div>
                        );
                      }

                      // Princess theme
                      return (
                        <div key={category.id} className={`flex items-center justify-between p-4 mb-4 mx-2 rounded-[20px] border-2 border-dashed bg-white/50 backdrop-blur-sm opacity-80 transition-all`}
                          style={{ borderColor: hexToRgba(CATEGORY_HUES[category.colorTheme] || '#FBCFE8', 0.8) }}
                        >
                          <div className="flex items-center gap-3">
                            {getIcon(category.icon, `w-5 h-5 text-slate-400`)}
                            <span className={`text-slate-500 font-bold text-lg`}>{category.label} <span className="text-sm opacity-60 ml-1">💭 (외출 중!)</span></span>
                          </div>
                          <button
                              onClick={restoreCategory}
                              style={{
                                color: CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185',
                                backgroundColor: 'white',
                                borderColor: CATEGORY_HUES[category.colorTheme] || '#FBCFE8',
                                borderWidth: '1.5px'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = (CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185'); e.currentTarget.style.color = 'white'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = (CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185'); }}
                              className={`text-xs px-3 py-1.5 rounded-[12px] font-bold transition-all shadow-sm`}
                          >
                            다시 부르기
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div id={popoutCategoryId ? "popout-content-wrapper" : undefined} key={category.id} className={`${theme.category.container} 
                        ${currentTheme === 'princess'
                          ? (isMiniMode 
                              ? (popoutCategoryId 
                                  ? `bg-white rounded-[15px] shadow-[0_4px_10px_rgba(255,182,193,0.4)] border-[2px] ${colorStyles.border} m-0` 
                                  : `bg-white rounded-[15px] shadow-[0_4px_10px_rgba(255,182,193,0.4)] border-none !w-auto mb-3 mx-2 mt-2`) 
                              : colorStyles.border) 
                          : (currentTheme === 'developer' 
                              ? (popoutCategoryId ? 'bg-[#1E1E1E] border border-[#3E3E42] rounded-md m-0 shadow-sm' : colorStyles.border + ' ' + colorStyles.bg + ' bg-opacity-5') 
                              : (popoutCategoryId && currentTheme === 'excel' ? 'bg-white border border-[#D1D1D1] m-0' : '')
                            )} ${popoutCategoryId ? 'flex-1 flex flex-col overflow-hidden' : ''} transition-all duration-300`}
                        style={popoutCategoryId ? { maxHeight: '100vh', height: '100vh' } : {}}
                      >
                        <div
                          className={`${theme.category.header} ${popoutCategoryId ? 'pt-2 pb-1.5 shrink-0' : ''}
                            ${currentTheme === 'princess'
                              ? (isMiniMode ? 'bg-transparent border-none px-3 py-1.5 rounded-t-[15px]' : colorStyles.border + ' border-b-2 border-dashed mx-[6px] mt-[6px] rounded-t-[15px]') // ✨ Mini Mode: Compact Header with Rounded Top
                              : (currentTheme === 'developer' ? 'bg-black/10 border-inherit' : '')}`}
                          style={{
                            ...(currentTheme === 'princess' ? { backgroundColor: headerBg } : {}),
                            WebkitAppRegion: popoutCategoryId ? 'drag' : 'auto'
                          }}
                        >
                          {getIcon(category.icon, `${isMiniMode ? 'w-3 h-3' : 'w-4 h-4'} ${colorStyles.icon}`)}
                          <h3 
                            className={`${theme.category.title} ${colorStyles.text} truncate ${isMiniMode ? 'text-xs' : getTextSizeClass(fontSize)}`}
                            style={typeof fontSize === 'number' ? (() => {
                              const base = isMiniMode ? Math.min(16, Math.max(11, fontSize - 2), fontSize) : (currentTheme === 'princess' ? fontSize + 1 : fontSize);
                              const mult = getFontScaleMultiplier(fontFamily, currentTheme, base);
                              return { fontSize: `${Math.round(base * mult)}px` };
                            })() : {}}
                          >
                            {category.label}
                          </h3>
                          <div className="flex items-center gap-2 ml-auto">
                            <span className={`${currentTheme === 'princess' ? (isMiniMode ? 'hidden' : 'inline') : (currentTheme === 'developer' || currentTheme === 'excel' ? 'hidden' : 'inline')}`} style={{ opacity: 0.3 }}>
                              {/* Line or Decoration */}
                            </span>
                            {/* ✨ Quick Add Button (Header) - Improved Design */}
                            <button
                              onClick={(e) => { e.stopPropagation(); setMiniModeAdderId(miniModeAdderId === category.id ? null : category.id); }}
                              data-trigger-id={category.id}
                              style={currentTheme === 'princess' ? {
                                WebkitAppRegion: popoutCategoryId ? 'no-drag' : 'auto',
                                color: miniModeAdderId === category.id ? '#FFFFFF' : (CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185'),
                                backgroundColor: miniModeAdderId === category.id ? (CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185') : 'transparent',
                                borderColor: (CATEGORY_HUES[category.colorTheme] || '#FBCFE8')
                              } : { WebkitAppRegion: popoutCategoryId ? 'no-drag' : 'auto' }}
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

                             {/* 📌 Pin/Unpin Button for Pop-out Window */}
                             {popoutCategoryId && (
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   const isCurrentlyPinned = pinnedCategories.includes(Number(category.id)) || pinnedCategories.includes(String(category.id));
                                   let newPinned;
                                   if (isCurrentlyPinned) {
                                     newPinned = pinnedCategories.filter(id => String(id) !== String(category.id));
                                   } else {
                                     newPinned = [...pinnedCategories, category.id];
                                   }
                                   setPinnedCategories(newPinned);
                                   localStorage.setItem('lumora_pinned_categories', JSON.stringify(newPinned));
                                 }}
                                 style={currentTheme === 'princess' ? {
                                   WebkitAppRegion: 'no-drag',
                                   color: CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185',
                                   backgroundColor: 'transparent',
                                   borderColor: CATEGORY_HUES[category.colorTheme] || '#FBCFE8'
                                 } : { WebkitAppRegion: 'no-drag' }}
                                 onMouseEnter={(e) => { if (currentTheme === 'princess') { e.currentTarget.style.backgroundColor = (CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185'); e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'transparent'; } }}
                                 onMouseLeave={(e) => { if (currentTheme === 'princess') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = (CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185'); e.currentTarget.style.borderColor = (CATEGORY_HUES[category.colorTheme] || '#FBCFE8'); } }}
                                 className={`flex items-center justify-center transition-all duration-300 mr-2 shadow-sm active:scale-95
                                 ${currentTheme === 'princess'
                                     ? 'w-6 h-6 rounded-[8px] border hover:shadow-md'
                                     : (currentTheme === 'excel' ? 'w-5 h-5 bg-[#F3F2F1] text-[#217346] hover:bg-[#217346] hover:text-white border border-[#D1D1D1] rounded-none' : 'w-5 h-5 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white rounded-md')}`}
                                 title={pinnedCategories.includes(Number(category.id)) || pinnedCategories.includes(String(category.id)) ? "고정 해제" : "항상 위에 고정"}
                               >
                                 {pinnedCategories.includes(Number(category.id)) || pinnedCategories.includes(String(category.id)) ? (
                                   <Pin className="w-3.5 h-3.5" />
                                 ) : (
                                   <PinOff className="w-3.5 h-3.5 opacity-60" />
                                 )}
                               </button>
                             )}

                             {/* ✨ Pop-out / Return Button */}
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 if (popoutCategoryId) {
                                   // Return to main window
                                   const updated = poppedOutCategories.filter(id => id !== category.id);
                                   setPoppedOutCategories(updated);
                                   localStorage.setItem('lumora_popped_out', JSON.stringify(updated));
                                   sendIPC('close-popout');
                                 } else {
                                   // Pop out
                                   const updated = [...poppedOutCategories, category.id];
                                   setPoppedOutCategories(updated);
                                   localStorage.setItem('lumora_popped_out', JSON.stringify(updated));

                                   // Add to pinned categories by default if not already there
                                   const isCurrentlyPinned = pinnedCategories.includes(Number(category.id)) || pinnedCategories.includes(String(category.id));
                                   let newPinned = pinnedCategories;
                                   if (!isCurrentlyPinned) {
                                     newPinned = [...pinnedCategories, category.id];
                                     setPinnedCategories(newPinned);
                                     localStorage.setItem('lumora_pinned_categories', JSON.stringify(newPinned));
                                   }

                                   sendIPC('open-popout', { categoryId: category.id, isPinned: true });
                                 }
                               }}
                               style={currentTheme === 'princess' ? {
                                 WebkitAppRegion: popoutCategoryId ? 'no-drag' : 'auto',
                                 color: CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185',
                                 backgroundColor: 'transparent',
                                 borderColor: CATEGORY_HUES[category.colorTheme] || '#FBCFE8'
                               } : { WebkitAppRegion: popoutCategoryId ? 'no-drag' : 'auto' }}
                               onMouseEnter={(e) => { if (currentTheme === 'princess') { e.currentTarget.style.backgroundColor = (CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185'); e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'transparent'; } }}
                               onMouseLeave={(e) => { if (currentTheme === 'princess') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = (CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185'); e.currentTarget.style.borderColor = (CATEGORY_HUES[category.colorTheme] || '#FBCFE8'); } }}
                               className={`flex items-center justify-center transition-all duration-300 mr-2 shadow-sm active:scale-95
                               ${currentTheme === 'princess'
                                   ? 'w-6 h-6 rounded-[8px] border hover:shadow-md group'
                                   : (currentTheme === 'excel' ? 'w-5 h-5 bg-[#F3F2F1] text-[#217346] hover:bg-[#217346] hover:text-white border border-[#D1D1D1] rounded-none' : 'w-5 h-5 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white rounded-md')}`}
                               title={popoutCategoryId ? "메인 화면으로 복귀" : "팝업으로 분리 (Pop-out)"}
                             >
                               {popoutCategoryId ? <X className="w-3.5 h-3.5" /> : <PanelTopOpen className="w-3.5 h-3.5" />}
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
                                className={`${(popoutCategoryId && !['princess', 'excel'].includes(currentTheme)) ? 'px-3 pb-3 pt-1' : `p-1 ${isMiniMode ? 'pb-1 pt-0' : 'pb-1'}`} ${popoutCategoryId ? 'flex-1 overflow-y-auto custom-scrollbar' : ''} space-y-1 ${categoryTasks.length === 0 && miniModeAdderId === category.id ? 'min-h-0 !p-0' : (categoryTasks.length > 0 ? 'min-h-0' : 'min-h-[60px]')} transition-colors duration-200 ${snapshot.isDraggingOver ? (currentTheme === 'princess' ? 'rounded-b-[15px]' : 'bg-slate-800/50 rounded') : ''} ${currentTheme === 'princess' ? (isMiniMode ? 'mx-[6px] mb-1 rounded-b-[15px]' : 'mx-[6px] mb-[6px] rounded-b-[15px]') : ''}`}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={currentTheme === 'princess' ? { backgroundColor: dropBg } : {}}
                              >
                                {categoryTasks.length === 0 && !snapshot.isDraggingOver && miniModeAdderId !== category.id && (
                                  <p className={`text-[10px] italic p-1.5 py-4 text-center ${
                                    currentTheme === 'princess' 
                                      ? 'text-[#D8A0A6] opacity-50' 
                                      : (currentTheme === 'developer' ? 'text-[#ABB2BF] opacity-50' : 'text-slate-500 opacity-60')
                                  }`}>비어 있음</p>
                                )}

                                {categoryTasks.map((task, index) => (
                                  <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                                    {(provided, snapshot) => (
                                      <TaskItem
                                        triggerPopoutResize={triggerPopoutResize}
                                        task={task}
                                        index={index}
                                        provided={provided}
                                        snapshot={snapshot}
                                        currentTheme={currentTheme}
                                        theme={theme}
                                        isMiniMode={isMiniMode}
                                        fontSize={fontSize}
                                        fontFamily={fontFamily}
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
                                        editingRecurrence={editingRecurrence}
                                        setEditingRecurrence={setEditingRecurrence}
                                        editingRecurrenceInterval={editingRecurrenceInterval}
                                        setEditingRecurrenceInterval={setEditingRecurrenceInterval}
                                        editingRecurrenceDays={editingRecurrenceDays}
                                        setEditingRecurrenceDays={setEditingRecurrenceDays}
                                        confirmingDeleteId={confirmingDeleteId}
                                        setConfirmingDeleteId={setConfirmingDeleteId}
                                        finalDeleteTask={finalDeleteTask}
                                        notifications={notifications}
                                        editFormRef={editFormRef}
                                        duplicateTask={duplicateTask}
                                         editingMemo={editingMemo}
                                         setEditingMemo={setEditingMemo}
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
                        <div ref={miniModeAdderId === category.id ? miniModeFormRef : null} className={`${miniModeAdderId === category.id ? `max-h-80 opacity-100 overflow-visible mb-4 ${currentTheme === 'princess' ? 'mt-1 px-2' : 'mt-2 px-2'}` : `max-h-0 opacity-0 mt-0 px-2 overflow-hidden`} transition-all duration-300 ease-in-out`}>
                            <form
                              onSubmit={(e) => addTask(e, category.id)}
                              style={currentTheme === 'princess' ? {
                                '--c-light': CATEGORY_HUES[category.colorTheme] || '#FFC0CB',
                                '--c-dark': CATEGORY_ICON_HUES[category.colorTheme] || '#FF6B81',
                                '--c-light-rgb': hexToRgba(CATEGORY_HUES[category.colorTheme] || '#FFC0CB', 0.6),
                                '--c-bg': hexToRgba(CATEGORY_HUES[category.colorTheme] || '#FFC0CB', 0.15)
                              } : {}}
                              className={`transition-all duration-300 w-full z-10 relative
                                   ${currentTheme === 'princess'
                                ? `bg-gradient-to-br from-[var(--c-bg)] to-white border border-[var(--c-light-rgb)] shadow-[0_8px_25px_var(--c-bg)] flex flex-col backdrop-blur-sm ${isMiniMode ? 'p-2.5 gap-2 rounded-[18px]' : 'p-3.5 gap-3 rounded-[24px]'}`
                                : (currentTheme === 'excel'
                                  ? 'bg-white border border-[#107C41] shadow-md p-0 grid gap-0'
                                  : 'bg-[#252526] border border-[#007ACC] shadow-2xl p-4 rounded-md font-mono')}`}
                          >
                            {/* Input Area */}
                            <div className={`flex w-full ${currentTheme === 'excel' ? 'bg-[#F3F2F1] p-2' : 'relative'}`}>
                              {currentTheme === 'developer' && <span className="absolute left-2 top-1.5 text-[#569CD6] mr-2 text-xs">{'>'}</span>}
                              <input
                                type="text"
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                placeholder={currentTheme === 'excel' ? '새 할 일을 입력하세요...' : "할 일을 입력하세요..."}
                                className={`w-full block outline-none transition-all
                                      ${currentTheme === 'princess'
                                    ? `bg-white border border-[var(--c-light)] text-slate-700 placeholder-[var(--c-dark)] focus:border-[var(--c-dark)] focus:ring-2 focus:ring-[var(--c-bg)] shadow-sm font-bold ${isMiniMode ? 'text-[12px] p-1.5 px-2.5 rounded-[12px]' : 'text-[13px] p-2 px-3.5 rounded-[16px]'}`
                                    : (currentTheme === 'excel'
                                      ? 'text-sm p-2 font-sans text-slate-800 border border-[#D1D1D1] bg-white focus:border-[#217346]'
                                      : 'text-sm p-1.5 pl-4 bg-[#3C3C3C] text-[#D4D4D4] placeholder-[#5C6370] font-mono border border-[#3E3E42] focus:border-[#007ACC]')}`}
                                autoFocus
                              />
                            </div>

                            {/* Memo Input Area */}
                            <div className={`w-full ${currentTheme === 'excel' ? 'bg-[#F3F2F1] px-2 pb-2' : 'mt-2'}`}>
                              <textarea
                                value={newTaskMemo}
                                onChange={(e) => setNewTaskMemo(e.target.value)}
                                placeholder={currentTheme === 'excel' ? '상세 메모를 입력하세요 (선택 사항)...' : "상세 메모를 입력하세요 (선택 사항)..."}
                                rows={2}
                                className={`w-full block resize-none outline-none transition-all
                                      ${currentTheme === 'princess'
                                    ? `bg-white border border-[var(--c-light-rgb)] text-slate-600 placeholder-[var(--c-dark)]/50 focus:border-[var(--c-dark)] focus:ring-2 focus:ring-[var(--c-bg)] shadow-sm font-semibold ${isMiniMode ? 'text-[11px] p-1.5 px-2.5 rounded-[10px]' : 'text-[12px] p-2 px-3.5 rounded-[14px]'}`
                                    : (currentTheme === 'excel'
                                      ? 'text-xs p-1.5 font-sans text-slate-700 border border-[#D1D1D1] bg-white focus:border-[#217346]'
                                      : 'text-xs p-1.5 pl-4 bg-[#3C3C3C] text-[#D4D4D4] placeholder-[#5C6370] font-mono border border-[#3E3E42] focus:border-[#007ACC]')}`}
                              />
                            </div>

                            {/* Controls Area - Mobile First Vertical Stack */}
                            <div className={`flex justify-between
                                ${currentTheme === 'princess' ? `flex-col w-full ${isMiniMode ? 'gap-2' : 'gap-3'}` : `flex-col sm:flex-row sm:items-center gap-2 ${currentTheme === 'excel' ? 'bg-[#F3F2F1] border-t border-[#D1D1D1] p-2' : 'mt-4'}`}`}>

                              <div className={`flex items-center gap-2 w-full ${currentTheme === 'princess' ? `bg-white border border-[var(--c-light)] shadow-sm justify-between ${isMiniMode ? 'p-1.5 rounded-[12px] pl-2 pr-1' : 'p-2 rounded-[16px] pl-3 pr-1.5'}` : 'flex-wrap justify-center sm:justify-start sm:w-auto'}`}>
                                <CustomDatePicker
                                  value={taskDate}
                                  onChange={(e) => setTaskDate(e.target.value)}
                                  placeholder="Date"
                                  inputClassName={`outline-none bg-transparent cursor-pointer
                                          ${currentTheme === 'princess' ? `text-[var(--c-dark)] font-bold text-left ${isMiniMode ? 'text-[11px] w-20' : 'text-xs w-24'}` : (currentTheme === 'excel' ? 'bg-white border border-[#D1D1D1] h-6 w-24 text-xs p-1 text-center' : 'bg-[#1E1E1E] text-[#CE9178] w-24 border-none text-xs text-center')}`}
                                  currentTheme={currentTheme}
                                />

                                {/* ✨ Recurrence Picker */}
                                <div className={`flex flex-wrap items-center gap-1`}>
                                  <div className={`flex items-center justify-center p-1 rounded-sm ${currentTheme === 'princess' ? 'bg-[var(--c-bg)] text-[var(--c-dark)]' : (currentTheme === 'excel' ? 'bg-[#107C41] text-white' : 'bg-[#007ACC] text-white')}`}>
                                    <Repeat className="w-3 h-3" />
                                  </div>
                                  <select
                                    value={taskRecurrence}
                                    onChange={(e) => setTaskRecurrence(e.target.value)}
                                    className={`outline-none bg-transparent cursor-pointer text-xs ${currentTheme === 'princess' ? 'text-[var(--c-dark)] font-bold' : (currentTheme === 'excel' ? 'bg-white border border-[#D1D1D1] h-6 px-1' : 'text-[#ABB2BF]')}`}
                                    title="반복 설정"
                                  >
                                    <option value="none" className={currentTheme === 'developer' ? 'bg-[#252526] text-[#D4D4D4]' : (currentTheme === 'princess' ? 'bg-white text-[#FF6B81] font-bold' : 'bg-white text-slate-800')}>안함</option>
                                    <option value="daily" className={currentTheme === 'developer' ? 'bg-[#252526] text-[#D4D4D4]' : (currentTheme === 'princess' ? 'bg-white text-[#FF6B81] font-bold' : 'bg-white text-slate-800')}>매일</option>
                                    <option value="weekly" className={currentTheme === 'developer' ? 'bg-[#252526] text-[#D4D4D4]' : (currentTheme === 'princess' ? 'bg-white text-[#FF6B81] font-bold' : 'bg-white text-slate-800')}>매주</option>
                                    <option value="monthly" className={currentTheme === 'developer' ? 'bg-[#252526] text-[#D4D4D4]' : (currentTheme === 'princess' ? 'bg-white text-[#FF6B81] font-bold' : 'bg-white text-slate-800')}>매월</option>
                                    <option value="custom" className={currentTheme === 'developer' ? 'bg-[#252526] text-[#D4D4D4]' : (currentTheme === 'princess' ? 'bg-white text-[#FF6B81] font-bold' : 'bg-white text-slate-800')}>N일</option>
                                  </select>
                                  {taskRecurrence === 'weekly' && renderDayPicker(taskRecurrenceDays, setTaskRecurrenceDays, taskDate)}
                                  {taskRecurrence === 'monthly' && (
                                    <span className={`text-[10px] ml-1 whitespace-nowrap ${currentTheme === 'princess' ? 'text-[var(--c-dark)] opacity-70 font-bold' : (currentTheme === 'excel' ? 'text-slate-500' : 'text-[#ABB2BF] opacity-70')}`}>
                                      {getRecurrenceHint(taskDate, taskRecurrence)}
                                    </span>
                                  )}
                                  {taskRecurrence === 'custom' && (
                                    <div className="flex items-center">
                                      <input
                                        type="number"
                                        min="1"
                                        value={taskRecurrenceInterval}
                                        onChange={(e) => setTaskRecurrenceInterval(e.target.value)}
                                        className={`w-8 text-center outline-none bg-transparent text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${currentTheme === 'princess' ? 'border-b border-[var(--c-dark)] text-[var(--c-dark)] font-bold' : (currentTheme === 'excel' ? 'bg-white border border-[#D1D1D1] h-6' : 'border-b border-[#3E3E42] text-[#D19A66]')}`}
                                      />
                                      <div className="flex flex-col ml-0.5">
                                        <button type="button" onClick={() => setTaskRecurrenceInterval(p => Math.max(1, Number(p) + 1))} className={`p-0 hover:bg-black/10 rounded-t ${currentTheme === 'princess' ? 'text-[var(--c-dark)]' : (currentTheme === 'excel' ? 'text-slate-600' : 'text-slate-400')}`}><ChevronUp className="w-2.5 h-2.5" /></button>
                                        <button type="button" onClick={() => setTaskRecurrenceInterval(p => Math.max(1, Number(p) - 1))} className={`p-0 hover:bg-black/10 rounded-b ${currentTheme === 'princess' ? 'text-[var(--c-dark)]' : (currentTheme === 'excel' ? 'text-slate-600' : 'text-slate-400')}`}><ChevronDown className="w-2.5 h-2.5" /></button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {currentTheme === 'princess' && <span className="text-pink-200 text-[10px] hidden sm:inline">|</span>}
                                <div className="flex items-center gap-1">
                                  <input type="text" value={taskHour} onChange={(e) => setTaskHour(e.target.value.replace(/[^0-9]/g, ''))} placeholder="12" maxLength={2} className={`text-center outline-none bg-transparent ${currentTheme === 'princess' ? `bg-[var(--c-bg)] border border-[var(--c-light)] text-[var(--c-dark)] font-bold focus:border-[var(--c-dark)] focus:bg-white transition-colors ${isMiniMode ? 'w-6 h-5 rounded-[6px] text-[10px]' : 'w-8 sm:w-7 h-6 rounded-[8px] text-xs'}` : (currentTheme === 'excel' ? 'w-8 sm:w-5 bg-white border border-[#D1D1D1] h-6 text-xs' : 'w-8 sm:w-5 text-[#D19A66] text-xs')}`} />
                                  <span className={`${currentTheme === 'princess' ? 'text-[var(--c-dark)] font-bold text-xs mx-0.5' : 'text-slate-400'}`}>:</span>
                                  <input type="text" value={taskMinute} onChange={(e) => setTaskMinute(e.target.value.replace(/[^0-9]/g, ''))} placeholder="00" maxLength={2} className={`text-center outline-none bg-transparent ${currentTheme === 'princess' ? `bg-[var(--c-bg)] border border-[var(--c-light)] text-[var(--c-dark)] font-bold focus:border-[var(--c-dark)] focus:bg-white transition-colors ${isMiniMode ? 'w-6 h-5 rounded-[6px] text-[10px]' : 'w-8 sm:w-7 h-6 rounded-[8px] text-xs'}` : (currentTheme === 'excel' ? 'w-8 sm:w-5 bg-white border border-[#D1D1D1] h-6 text-xs' : 'w-8 sm:w-5 text-[#D19A66] text-xs')}`} />
                                  <button type="button" onClick={() => setTaskAmpm(p => p === '오전' ? '오후' : '오전')} className={`ml-1 flex items-center justify-center transition-all ${currentTheme === 'princess' ? `bg-[var(--c-dark)] text-white font-bold shadow-sm opacity-90 hover:opacity-100 ${isMiniMode ? 'px-1.5 py-0.5 rounded-[6px] text-[8px]' : 'px-2 py-1 rounded-[8px] text-[9px]'}` : (currentTheme === 'excel' ? 'bg-white border border-[#D1D1D1] h-6 px-1 text-[10px]' : 'text-[#569CD6] text-xs')}`}>{taskAmpm === '오전' ? 'AM' : 'PM'}</button>
                                </div>
                              </div>

                              {/* Right: Actions */}
                              <div className={`flex items-center gap-2 w-full ${currentTheme === 'princess' ? '' : 'sm:w-auto mt-1 sm:mt-0'}`}>
                                {/* Cancel */}
                                <button
                                  type="button"
                                  onClick={() => setMiniModeAdderId(null)}
                                  className={`flex items-center justify-center transition-all cursor-pointer flex-1 sm:flex-none
                                      ${currentTheme === 'princess'
                                      ? `bg-white text-[var(--c-dark)] border border-[var(--c-light)] shadow-sm hover:bg-[var(--c-bg)] hover:text-[var(--c-dark)] ${isMiniMode ? 'h-7 sm:w-7 sm:h-7 rounded-[10px]' : 'h-9 sm:w-9 sm:h-9 rounded-[14px]'}`
                                      : (currentTheme === 'excel' ? 'w-full sm:w-auto px-4 py-1 bg-white border border-[#D1D1D1] hover:bg-slate-100 text-xs text-slate-700' : 'w-full sm:w-auto text-[#ABB2BF] text-xs hover:bg-[#3E3E42] px-3 py-1 rounded')}`}
                                  title="취소"
                                >
                                  {currentTheme === 'excel' ? 'Cancel' : (currentTheme === 'developer' ? '[ESC]' : <X className={`w-4 h-4 ${currentTheme === 'princess' ? 'stroke-[3px]' : ''}`} />)}
                                </button>
                                {/* Submit */}
                                <button
                                  type="submit"
                                  className={`flex items-center justify-center transition-all active:scale-95 cursor-pointer flex-1 sm:flex-none
                                      ${currentTheme === 'princess'
                                      ? `bg-[var(--c-dark)] text-white shadow-[0_4px_10px_var(--c-bg)] hover:shadow-[0_6px_15px_var(--c-bg)] hover:-translate-y-0.5 opacity-90 hover:opacity-100 ${isMiniMode ? 'h-7 sm:w-7 sm:h-7 rounded-[10px]' : 'h-9 sm:w-9 sm:h-9 rounded-[14px]'}`
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


            {/* Footer - ✨ HIDDEN IN MINI MODE & POP-OUT WINDOWS */}
            {
              !popoutCategoryId && !isSettingsOpen && !isMiniMode && (
                <div className={`mt-auto p-2 border-t ${currentTheme === 'princess'
                  ? 'border-[#FFC0CB] bg-[#FFF0F5]'
                  : (currentTheme === 'developer'
                    ? 'bg-[#21252B] border-[#3E3E42]'
                    : (currentTheme === 'excel' ? 'bg-[#217346] text-white border-t-4 border-[#107C41]' : 'border-slate-800 bg-slate-900/50') // ✨ Excel Status Bar
                  )} text-center shrink-0`}>
                  <p className={`text-[9px] font-mono ${currentTheme === 'princess' ? 'text-[#F472B6] font-bold tracking-widest' : (currentTheme === 'excel' ? 'text-white font-sans text-left px-2 font-bold' : 'text-slate-600')}`}>
                    {currentTheme === 'princess' ? 'Code Tiara 💖 (Created by Lumora)' : (currentTheme === 'excel' ? 'Ready' : 'Code Tiara (Console Active)')}
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
                        {currentTheme === 'princess' ? <AlertTriangle className="w-5 h-5 stroke-[2.5px]" /> : <AlertTriangle className={`w-5 h-5 ${currentTheme === 'developer' ? 'text-[#E5C07B]' : 'text-red-500'}`} />}
                      </div>
                      <h3 className={`font-bold text-lg 
                        ${currentTheme === 'princess' ? 'text-slate-700 font-[Gaegu] tracking-wide' : (currentTheme === 'excel' ? 'text-white' : 'text-[#E5C07B]')}`}>
                        {currentTheme === 'excel' ? 'Confirm Cleanup' : (currentTheme === 'developer' ? 'SYS_CLEANUP_REQ' : '완료 항목 정리')}
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
                              : 'px-4 py-2 bg-[#E5C07B]/10 text-[#E5C07B] border border-[#E5C07B]/50 hover:bg-[#E5C07B]/20 text-xs rounded')}`}
                      >
                        {currentTheme === 'excel' ? '정리' : (currentTheme === 'developer' ? '[EXECUTE]' : '삭제')}
                      </button>
                    </div>
                  </div>
                </div>
              )
            }
          </>
        )}
      </>
    )}
        {isAuthModalOpen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[9999] overflow-y-auto flex justify-center p-4">
            <div className="relative w-full max-w-md my-auto flex-shrink-0">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className={`absolute top-3 right-3 p-1 hover:bg-slate-700/10 transition-colors z-[10000] border-0 bg-transparent cursor-pointer ${currentTheme === 'excel' ? 'text-black' : (currentTheme === 'developer' ? 'text-[#ABB2BF]' : 'text-[#FF6B81]')}`}
                title="닫기"
              >
                <X className="w-5 h-5" />
              </button>
              <AuthScreen 
                currentTheme={currentTheme} 
                onAuthSuccess={handleAuthSuccess} 
                onThemeChange={setCurrentTheme}
                isModal={true}
              />
            </div>
          </div>
        )}
      </div >
    </div >
  );
};

export default CodeTiara;
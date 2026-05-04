import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calculator, Calendar as CalendarIcon } from 'lucide-react';
import { THEME_CONFIG } from '../constants/themeConfig';

const CustomDatePicker = ({ value, onChange, placeholder = "YYYY-MM-DD", className = "", inputClassName = "", currentTheme = "developer", customTrigger }) => {
    const themeConfig = THEME_CONFIG[currentTheme] || THEME_CONFIG['developer'];
    const styles = themeConfig.datePicker;
    const defaultInputClass = styles.input;

    const finalInputClass = inputClassName || defaultInputClass;
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date()); // For navigation
    const [selectedDate, setSelectedDate] = useState(null); // For selection highlighting
    const [coords, setCoords] = useState({ top: 0, left: 0 }); // ✨ Portal Coordinates
    // Removed placement state to use direct DOM manipulation
    const containerRef = useRef(null);
    const popupRef = useRef(null); // ✨ Ref for direct DOM manipulation

    // Initialize from value prop
    useEffect(() => {
        if (value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                setSelectedDate(date);
                setCurrentDate(date);
            }
        } else {
            setSelectedDate(null);
            // If no value, keep currentDate as today for navigation
        }
    }, [value]);

    // Click outside listener to close (Modified for Portal)
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is outside BOTH the container (input) AND the portal (popup)
            // We'll attach a ref to the portal content wrapper locally in the render
            // But since it's a Portal, we can't easily ref it from here unless we ref the content div there
            // Actually, event.target checking is tricky with Portals if not carefully done.
            // React events bubble through Portals, but DOM events don't naturally.
            // However, we are using document.addEventListener which matches DOM.
            // So we need to ensure we don't close if clicking inside the portal.

            // Fix: Add a specific ID data attribute or class to the popup for detection
            if (isOpen) {
                const popupEl = document.getElementById('custom-datepicker-popup');
                if (containerRef.current && !containerRef.current.contains(event.target) && (!popupEl || !popupEl.contains(event.target))) {
                    setIsOpen(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // ✨ Dynamic Position Update (Synchronous for speed)
    const updatePosition = () => {
        if (containerRef.current && popupRef.current && isOpen) {
            const rect = containerRef.current.getBoundingClientRect();
            const popupHeight = 240; // Reduced from 280
            const popupWidth = 180; // Reduced from 220
            const spaceBelow = window.innerHeight - rect.bottom;

            let top = rect.bottom + 4;
            let left = rect.left;

            // Smart Flip: Open Upwards if tight (Threshold reduced)
            if (spaceBelow < popupHeight && rect.top > popupHeight) {
                top = rect.top - popupHeight - 4;
            }

            // Horizontal Guard
            if (left + popupWidth > window.innerWidth - 10) {
                left = (rect.right - popupWidth) > 0 ? (rect.right - popupWidth) : 10;
            }

            // Apply directly to DOM to avoid React render lag
            popupRef.current.style.top = `${top}px`;
            popupRef.current.style.left = `${left}px`;
        }
    };

    // Update coords on scroll/resize if open
    useEffect(() => {
        if (!isOpen) return;

        // Initial set
        updatePosition();

        // Close on external scroll/wheel to avoid "floating" jitter
        const handleScrollOrWheel = (e) => {
            // If the scroll event originated from inside the popup, don't close
            if (popupRef.current && popupRef.current.contains(e.target)) {
                return;
            }
            setIsOpen(false);
        };

        const handleResize = () => setIsOpen(false); // Close on resize

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScrollOrWheel, true); // Capture phase 
        window.addEventListener('wheel', handleScrollOrWheel, true);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScrollOrWheel, true);
            window.removeEventListener('wheel', handleScrollOrWheel, true);
        };
    }, [isOpen]);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };


    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        // 0 = Sunday, 1 = Monday, ...
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        // Create date string in local time YYYY-MM-DD
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        const dateStr = `${year}-${mm}-${dd}`;

        onChange({ target: { value: dateStr } }); // Mock event object for compatibility
        setIsOpen(false);
    };

    const renderCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="p-1"></div>);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = value === dateStr;
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            days.push(
                <button
                    key={day}
                    onClick={(e) => {
                        e.preventDefault(); // Prevent form submission
                        handleDateClick(day);
                    }}
                    className={`
                    p-1 text-[10px] rounded transition-all w-5 h-5 flex items-center justify-center mx-auto
                    ${isSelected ? styles.daySelected : styles.dayDefault}
                    ${isToday && !isSelected ? styles.dayToday : ''}
                `}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    // Month names
    const monthNames = [
        "1월", "2월", "3월", "4월", "5월", "6월",
        "7월", "8월", "9월", "10월", "11월", "12월"
    ];

    const popupContent = (
        <div
            id="custom-datepicker-popup"
            ref={popupRef}
            style={{
                position: 'fixed',
                zIndex: 99999,
                width: '180px' // Reduced from 208px
            }}
            className={`absolute rounded-[16px] p-2 animate-in fade-in zoom-in-95 duration-75 ${styles.popup}`} // duration-75 for faster appearance
        >
            {/* Header */}
            <div className={`flex justify-between items-center mb-3 p-1 rounded ${styles.header}`}>
                <button onClick={(e) => { e.preventDefault(); handlePrevMonth(); }} className={`p-1 rounded transition-colors ${styles.arrow}`}>
                    <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="text-sm font-bold">
                    {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
                </div>
                <button onClick={(e) => { e.preventDefault(); handleNextMonth(); }} className={`p-1 rounded transition-colors ${styles.arrow}`}>
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-2 text-center">
                {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                    <div key={d} className={`text-[10px] font-bold ${currentTheme === 'princess' ? 'text-[#F472B6]' : 'text-slate-500'}`}>{d}</div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 text-center gap-0.5">
                {renderCalendarDays()}
            </div>

            {/* Footer - Optional: Clear / Today */}
            <div className={`flex justify-between mt-3 pt-2 border-t ${currentTheme === 'princess' ? 'border-dashed border-[#FFC0CB]' : 'border-slate-800'}`}>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onChange({ target: { value: '' } });
                        setIsOpen(false);
                    }}
                    className="text-[10px] text-slate-400 hover:text-red-400"
                >
                    지우기
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        const today = new Date();
                        const year = today.getFullYear();
                        const mm = String(today.getMonth() + 1).padStart(2, '0');
                        const dd = String(today.getDate()).padStart(2, '0');
                        onChange({ target: { value: `${year}-${mm}-${dd}` } });
                        setIsOpen(false);
                    }}
                    className={`text-[10px] ${styles.footerBtn}`}
                >
                    오늘
                </button>
            </div>
        </div>
    );

    return (
        <div className="relative flex items-center" ref={containerRef}>
            {customTrigger ? (
                <div onClick={toggleOpen} className="cursor-pointer flex items-center">
                    {customTrigger}
                </div>
            ) : (
                <div
                    onClick={toggleOpen}
                    className={`flex items-center gap-1.5 cursor-pointer rounded px-2 py-0.5 min-w-[80px] h-[26px] transition-colors ${finalInputClass} ${className}`}
                >
                    <CalendarIcon className="w-3 h-3 opacity-70" />
                    <span className={`text-xs whitespace-nowrap ${value ? 'opacity-100' : 'opacity-70'}`}>
                        {value || placeholder}
                    </span>
                </div>
            )}

            {/* ✨ RENDER: Portal */}
            {isOpen && createPortal(popupContent, document.body)}
        </div>
    );
};

export default CustomDatePicker;

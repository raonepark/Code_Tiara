import React, { memo, useState } from 'react';
import {
    Trash2, X, Check, Edit2, Clock, CheckCircle2, Circle, Copy, Repeat, ChevronUp, ChevronDown, FileText
} from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';
import { CATEGORY_HUES, hexToRgba, getLocalDateString, parseLocalDate } from '../constants';

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

const TaskItem = memo(({
    task, index, provided, snapshot,
    currentTheme, theme, isMiniMode,
    fontSize, fontFamily,
    getTextSizeClass, getSubTextSizeClass, formatTimeDisplay,
    category, borderIdle, borderHover, CATEGORY_ICON_HUES,
    toggleTask,
    editingTaskId, startEditing, saveEditing, cancelEditing,
    editingText, setEditingText,
    editingDate, setEditingDate,
    editingHour, setEditingHour,
    editingMinute, setEditingMinute,
    editingAmpm, setEditingAmpm,
    editingRecurrence, setEditingRecurrence,
    editingRecurrenceInterval, setEditingRecurrenceInterval,
    editingRecurrenceDays, setEditingRecurrenceDays,
    confirmingDeleteId, setConfirmingDeleteId, finalDeleteTask, duplicateTask,
    notifications,
    editFormRef,
    editingMemo,
    setEditingMemo
}) => {
    const [isMemoExpanded, setIsMemoExpanded] = useState(false);

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

    const getRecurrenceDisplayText = (taskObj) => {
        if (!taskObj.recurrence || taskObj.recurrence === 'none') return null;
        
        if (taskObj.recurrence === 'daily') return '매일';
        if (taskObj.recurrence === 'monthly') {
            const d = parseLocalDate(taskObj.dueDate || getLocalDateString());
            return `매월 ${d.getDate()}일`;
        }
        if (taskObj.recurrence === 'custom') return `${taskObj.recurrenceInterval || 1}일마다`;
        if (taskObj.recurrence === 'weekly') {
            const daysArr = ['일', '월', '화', '수', '목', '금', '토'];
            if (taskObj.recurrenceDays && taskObj.recurrenceDays.length > 0) {
                const dayStrings = taskObj.recurrenceDays.map(d => daysArr[d]).join(', ');
                return `매주 ${dayStrings}요일`;
            } else {
                const d = parseLocalDate(taskObj.dueDate || getLocalDateString());
                return `매주 ${daysArr[d.getDay()]}요일`;
            }
        }
        return '';
    };

    return (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
                ...provided.draggableProps.style,
                '--border-idle': borderIdle,
                '--border-hover': borderHover,
                '--icon-color': CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185',
                ...(currentTheme === 'princess' ? {
                    '--c-light': CATEGORY_HUES[category.colorTheme] || '#FFC0CB',
                    '--c-dark': CATEGORY_ICON_HUES[category.colorTheme] || '#FF6B81',
                    '--c-light-rgb': hexToRgba(CATEGORY_HUES[category.colorTheme] || '#FFC0CB', 0.6),
                    '--c-bg': hexToRgba(CATEGORY_HUES[category.colorTheme] || '#FFC0CB', 0.15)
                } : {})
            }}
            onClick={() => { if (editingTaskId !== task.id) toggleTask(task.id) }}
            className={`${theme.category.taskItem} ${isMiniMode ? '!mx-0 !mb-1 !p-1.5 last:!mb-0' : ''} cursor-pointer active:cursor-grabbing relative ${task.completed ? 'opacity-60' : ''} ${snapshot.isDragging ? 'shadow-lg z-50 ' + theme.task.dragShadow : ''}`}
        >
            {currentTheme === 'excel' ? (
                <div className={theme.task.checkboxExcel}
                    onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                >
                    {task.completed && <Check className={theme.task.checkboxExcelCheck} strokeWidth={3} />}
                </div>
            ) : (
                <button
                    onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                    className={`mt-0.5 flex-shrink-0 transition-colors ${task.completed ? theme.task.checkboxDone : theme.task.checkbox}`}
                >
                    {task.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </button>
            )}

            <div className="flex-1 flex flex-col min-w-0 text-left">
                {editingTaskId === task.id ? (
                    /* ✨ SIMPLE EDIT TASK INTERFACE */
                    <div ref={editFormRef} className={`w-full relative transition-all duration-300 z-10 ${theme.task.editContainer}`} onClick={e => e.stopPropagation()}>

                        {/* 1. Top Input Area */}
                        <div className={`${theme.task.editInputBgWrapper}`}>
                            {currentTheme === 'developer' && <div className="text-[#569CD6] text-xs mb-1">mode: EDIT_TASK</div>}
                            <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditing(task.id);
                                    if (e.key === 'Escape') cancelEditing();
                                }}
                                autoFocus
                                className={`w-full bg-transparent focus:outline-none transition-all ${theme.task.editInputBg}`}
                                style={typeof fontSize === 'number' ? { fontSize: `${Math.round(fontSize * getFontScaleMultiplier(fontFamily, currentTheme, fontSize))}px` } : {}}
                                placeholder={currentTheme === 'excel' ? '할 일을 수정하세요...' : "Edit task..."}
                            />
                        </div>

                        {/* Memo Edit Area */}
                        <div className={`mt-2 ${currentTheme === 'excel' ? 'bg-[#F3F2F1] p-2 border-t border-[#D1D1D1]' : ''}`}>
                            <textarea
                                value={editingMemo}
                                onChange={(e) => setEditingMemo(e.target.value)}
                                onKeyDown={(e) => {
                                    // Ctrl+Enter or Cmd+Enter to save, regular Enter to type newline
                                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                        e.preventDefault();
                                        saveEditing(task.id);
                                    }
                                    if (e.key === 'Escape') cancelEditing();
                                }}
                                placeholder={currentTheme === 'excel' ? '상세 메모...' : "상세 메모..."}
                                rows={2}
                                className={`w-full bg-transparent focus:outline-none resize-none transition-all block
                                    ${currentTheme === 'princess'
                                        ? 'border border-[var(--c-light-rgb)] focus:border-[var(--c-dark)] text-slate-600 rounded-xl p-2 text-xs font-semibold bg-white'
                                        : (currentTheme === 'excel'
                                            ? 'border border-[#D1D1D1] bg-white text-xs p-1.5 text-slate-800 font-sans focus:border-[#217346]'
                                            : 'border border-[#3E3E42] bg-[#1E1E1E] text-[#D4D4D4] font-mono text-[11px] p-2 focus:border-[#007ACC]')
                                    }`}
                            />
                            <div className={`text-[9px] mt-0.5 text-right opacity-60 ${currentTheme === 'developer' ? 'font-mono text-[#5C6370]' : 'text-slate-400'}`}>
                                {currentTheme === 'developer' ? 'Ctrl+Enter: Save | Enter: Newline' : 'Ctrl+Enter로 저장 / Enter로 줄바꿈'}
                            </div>
                        </div>

                        {/* 2. Controls Row - Mobile First Vertical Stack */}
                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${theme.task.editActionRow}`}>

                            {/* Left: Date/Time */}
                            <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-1 sm:gap-2 w-full sm:w-auto ${theme.task.editDateWrapper}`}>
                                <CustomDatePicker
                                    value={editingDate}
                                    onChange={(e) => setEditingDate(e.target.value)}
                                    placeholder="Date"
                                    inputClassName={`bg-transparent text-center focus:outline-none cursor-pointer ${theme.task.editDateInput}`}
                                    currentTheme={currentTheme}
                                />

                                <div className="flex flex-wrap items-center gap-1">
                                  <div className={`flex items-center justify-center p-1 rounded-sm ${currentTheme === 'princess' ? 'bg-[var(--c-bg)] text-[var(--c-dark)]' : (currentTheme === 'excel' ? 'bg-[#107C41] text-white' : 'bg-[#007ACC] text-white')}`}>
                                    <Repeat className="w-3 h-3" />
                                  </div>
                                  <select
                                    value={editingRecurrence}
                                    onChange={(e) => setEditingRecurrence(e.target.value)}
                                    className={`outline-none bg-transparent cursor-pointer text-xs ${currentTheme === 'princess' ? 'text-[var(--c-dark)] font-bold' : (currentTheme === 'excel' ? 'bg-white border border-[#D1D1D1] h-6 px-1' : 'text-[#ABB2BF]')}`}
                                    title="반복 설정"
                                  >
                                    <option value="none" className={currentTheme === 'developer' ? 'bg-[#252526] text-[#D4D4D4]' : (currentTheme === 'princess' ? 'bg-white text-[#FF6B81] font-bold' : 'bg-white text-slate-800')}>안함</option>
                                    <option value="daily" className={currentTheme === 'developer' ? 'bg-[#252526] text-[#D4D4D4]' : (currentTheme === 'princess' ? 'bg-white text-[#FF6B81] font-bold' : 'bg-white text-slate-800')}>매일</option>
                                    <option value="weekly" className={currentTheme === 'developer' ? 'bg-[#252526] text-[#D4D4D4]' : (currentTheme === 'princess' ? 'bg-white text-[#FF6B81] font-bold' : 'bg-white text-slate-800')}>매주</option>
                                    <option value="monthly" className={currentTheme === 'developer' ? 'bg-[#252526] text-[#D4D4D4]' : (currentTheme === 'princess' ? 'bg-white text-[#FF6B81] font-bold' : 'bg-white text-slate-800')}>매월</option>
                                    <option value="custom" className={currentTheme === 'developer' ? 'bg-[#252526] text-[#D4D4D4]' : (currentTheme === 'princess' ? 'bg-white text-[#FF6B81] font-bold' : 'bg-white text-slate-800')}>N일</option>
                                  </select>
                                  {editingRecurrence === 'weekly' && renderDayPicker(editingRecurrenceDays, setEditingRecurrenceDays, editingDate)}
                                  {editingRecurrence === 'monthly' && (
                                    <span className={`text-[10px] ml-1 whitespace-nowrap ${currentTheme === 'princess' ? 'text-[var(--c-dark)] opacity-70 font-bold' : (currentTheme === 'excel' ? 'text-slate-500' : 'text-[#ABB2BF] opacity-70')}`}>
                                      {getRecurrenceHint(editingDate, editingRecurrence)}
                                    </span>
                                  )}
                                  {editingRecurrence === 'custom' && (
                                    <div className="flex items-center">
                                      <input
                                        type="number"
                                        min="1"
                                        value={editingRecurrenceInterval}
                                        onChange={(e) => setEditingRecurrenceInterval(e.target.value)}
                                        className={`w-8 text-center outline-none bg-transparent text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${currentTheme === 'princess' ? 'border-b border-[var(--c-dark)] text-[var(--c-dark)] font-bold' : (currentTheme === 'excel' ? 'bg-white border border-[#D1D1D1] h-6' : 'border-b border-[#3E3E42] text-[#D19A66]')}`}
                                      />
                                      <div className="flex flex-col ml-0.5">
                                        <button type="button" onClick={() => setEditingRecurrenceInterval(p => Math.max(1, Number(p) + 1))} className={`p-0 hover:bg-black/10 rounded-t ${currentTheme === 'princess' ? 'text-[var(--c-dark)]' : (currentTheme === 'excel' ? 'text-slate-600' : 'text-slate-400')}`}><ChevronUp className="w-2.5 h-2.5" /></button>
                                        <button type="button" onClick={() => setEditingRecurrenceInterval(p => Math.max(1, Number(p) - 1))} className={`p-0 hover:bg-black/10 rounded-b ${currentTheme === 'princess' ? 'text-[var(--c-dark)]' : (currentTheme === 'excel' ? 'text-slate-600' : 'text-slate-400')}`}><ChevronDown className="w-2.5 h-2.5" /></button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {currentTheme === 'princess' && <span className="text-pink-200 text-[10px] hidden sm:inline">|</span>}

                                <div className="flex items-center gap-0.5">
                                    <input
                                        type="text"
                                        value={editingHour}
                                        onChange={(e) => setEditingHour(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="12" maxLength={2}
                                        className={`w-4 sm:w-5 text-center bg-transparent focus:outline-none ${theme.task.editTimeInput}`}
                                    />
                                    <span className={`${theme.task.editTimeSeparator}`}>:</span>
                                    <input
                                        type="text"
                                        value={editingMinute}
                                        onChange={(e) => setEditingMinute(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="00" maxLength={2}
                                        className={`w-4 sm:w-5 text-center bg-transparent focus:outline-none ${theme.task.editTimeInput}`}
                                    />
                                    <button
                                        onClick={() => setEditingAmpm(p => p === '오전' ? '오후' : '오전')}
                                        className={`ml-1 flex items-center justify-center transition-all bg-transparent ${theme.task.editAmpmBtn}`}
                                    >
                                        {editingAmpm === '오전' ? 'AM' : 'PM'}
                                    </button>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                                <button
                                    onClick={cancelEditing}
                                    className={`transition-all flex items-center justify-center flex-1 sm:flex-none ${theme.task.editCancelBtn}`}
                                >
                                    {currentTheme === 'excel' ? 'Cancel' : (currentTheme === 'developer' ? '[ESC]' : (isMiniMode ? '취소' : <X className="w-4 h-4" />))}
                                </button>
                                <button
                                    onClick={() => saveEditing(task.id)}
                                    className={`transition-all flex items-center justify-center flex-1 sm:flex-none ${theme.task.editSaveBtn}`}
                                >
                                    {currentTheme === 'excel' ? 'Save' : (currentTheme === 'developer' ? '[ENTER]' : (isMiniMode ? '저장' : <Check className="w-4 h-4 stroke-[2.5px]" />))}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <span
                            className={`break-words leading-snug 
                            ${(isMiniMode && (currentTheme === 'developer' || currentTheme === 'excel'))
                                    ? 'text-xs'
                                    : getTextSizeClass(fontSize)}
                            ${task.completed ? theme.task.textDone : theme.task.textDefault}`}
                            style={typeof fontSize === 'number' ? (() => {
                                const base = isMiniMode ? Math.min(17, Math.max(11, fontSize - 2), fontSize) : fontSize;
                                const mult = getFontScaleMultiplier(fontFamily, currentTheme, base);
                                return { fontSize: `${Math.round(base * mult)}px` };
                            })() : {}}
                        >
                            {task.text}
                        </span>
                        {/* 마감 시간 & 반복 정보 */}
                        {(task.dueTime || task.dueDate || (task.recurrence && task.recurrence !== 'none')) && (
                            <span className={`flex flex-wrap items-center gap-1 mt-0.5 ${task.completed ? `${theme.task.timeDefault} opacity-50` :
                                (task.alerted && notifications.some(n => n.taskId === task.id)) ? 'text-red-400 font-bold animate-pulse' :
                                    theme.task.timeDefault
                                } 
                                ${(isMiniMode && (currentTheme === 'developer' || currentTheme === 'excel'))
                                    ? 'text-[10px]'
                                    : getSubTextSizeClass(fontSize)}`}
                            style={typeof fontSize === 'number' ? (() => {
                                const base = isMiniMode ? Math.min(14, Math.max(9, fontSize - 5), fontSize - 3) : Math.max(10, fontSize - 3);
                                const mult = getFontScaleMultiplier(fontFamily, currentTheme, base);
                                return { fontSize: `${Math.round(base * mult)}px` };
                            })() : {}}
                        >
                                {(task.dueTime || task.dueDate) && (
                                    <>
                                        <Clock className="w-2.5 h-2.5" />
                                        {task.dueDate && <span className="mr-1">{task.dueDate.slice(5).replace('-', '/')}</span>}
                                        {formatTimeDisplay(task.dueTime)}
                                    </>
                                )}
                                {task.recurrence && task.recurrence !== 'none' && (
                                    <span className={`flex items-center gap-0.5 ${(task.dueTime || task.dueDate) ? 'ml-1 border-l pl-1.5' : ''} ${currentTheme === 'princess' ? 'border-[var(--c-light)]' : 'border-slate-500'}`}>
                                        <Repeat className="w-2.5 h-2.5" />
                                        <span className={currentTheme === 'princess' ? 'text-[var(--c-dark)] font-bold' : ''}>
                                            {getRecurrenceDisplayText(task)}
                                        </span>
                                    </span>
                                )}
                            </span>
                        )}

                        {/* 상세 메모 표시 */}
                        {task.memo && task.memo.trim() !== '' && (
                            <div 
                                className="mt-1.5 w-full"
                                onClick={(e) => {
                                    e.stopPropagation(); // 투두 체크 방지
                                    setIsMemoExpanded(!isMemoExpanded);
                                }}
                            >
                                {/* Collapsed (Summary) Mode */}
                                {!isMemoExpanded ? (
                                    <div 
                                        className={`flex items-center gap-1 text-[10px] select-none hover:opacity-100 transition-opacity cursor-pointer
                                            ${currentTheme === 'princess'
                                                ? 'text-[var(--c-dark)] opacity-70 bg-[var(--c-bg)] border border-[var(--c-light-rgb)] px-2 py-0.5 rounded-full w-fit max-w-[90%]'
                                                : (currentTheme === 'excel'
                                                    ? 'text-[#217346] font-semibold bg-[#E1F5FE] border border-[#B3E5FC] px-1.5 py-0.5 w-fit max-w-[95%] rounded'
                                                    : 'text-[#5C6370] font-mono opacity-80 border border-[#3E3E42] bg-[#2D2D30] px-1.5 py-0.5 w-fit max-w-[95%] rounded-sm')
                                            }`}
                                    >
                                        <FileText className="w-2.5 h-2.5 flex-shrink-0" />
                                        <span className="truncate">{task.memo.split('\n')[0] || '메모 보기...'}</span>
                                    </div>
                                ) : (
                                    /* Expanded (Detail) Mode */
                                    <div 
                                        className={`p-2.5 text-xs shadow-inner cursor-pointer select-text transition-all duration-200
                                            ${currentTheme === 'princess'
                                                ? 'bg-gradient-to-br from-[var(--c-bg)] to-white border border-dashed border-[var(--c-light)] text-slate-700 font-medium rounded-2xl whitespace-pre-wrap font-sans leading-relaxed'
                                                : (currentTheme === 'excel'
                                                    ? 'bg-[#FFF8E1] border border-[#FFE082] text-slate-700 font-sans whitespace-pre-wrap leading-normal shadow-sm relative before:content-[\'\'] before:absolute before:top-0 before:right-0 before:border-[6px] before:border-t-[#FFE082] before:border-r-[#FFE082] before:border-b-transparent before:border-l-transparent'
                                                    : 'bg-[#1E1E1E] border-l-2 border-l-[#007ACC] border border-[#3E3E42] text-[#ABB2BF] font-mono text-[11px] whitespace-pre-wrap leading-normal rounded-sm')
                                            }`}
                                    >
                                        <div className={`flex items-center justify-between border-b pb-1 mb-1 text-[9px] font-bold select-none
                                            ${currentTheme === 'princess'
                                                ? 'border-[var(--c-light-rgb)] text-[var(--c-dark)]'
                                                : (currentTheme === 'excel'
                                                    ? 'border-[#FFE082] text-[#B71C1C]'
                                                    : 'border-[#3E3E42] text-[#608B4E]')
                                            }`}
                                        >
                                            <span className="flex items-center gap-1">
                                                <FileText className="w-3 h-3" />
                                                {currentTheme === 'developer' ? '// Memo detail' : '상세 메모'}
                                            </span>
                                            <span className="opacity-60 text-[8px]">
                                                {currentTheme === 'developer' ? 'Click to collapse' : '접으려면 클릭'}
                                            </span>
                                        </div>
                                        <div className="whitespace-pre-wrap break-words">{task.memo}</div>
                                    </div>
                                )}
                            </div>
                        )}
                     </>
                )}
            </div>

            {/* Action Buttons (Hover) */}
            {editingTaskId !== task.id && (
                <div className={`absolute right-5 flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 ${theme.category?.actionButton ? theme.category.actionButton.wrapper : 'gap-2'}`}>
                    {/* Duplicate Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); duplicateTask(task); }}
                        className={theme.category?.actionButton ? theme.category.actionButton.button : theme.task.actionBtn}
                        title="복제"
                    >
                        <Copy className={theme.category?.actionButton ? theme.category.actionButton.icon : "w-3 h-3"} />
                    </button>

                    {/* Edit Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); startEditing(task); }}
                        className={theme.category?.actionButton ? theme.category.actionButton.button : theme.task.actionBtn}
                        title="수정"
                    >
                        <Edit2 className={theme.category?.actionButton ? theme.category.actionButton.icon : "w-3 h-3"} />
                    </button>

                    {/* Delete Button (Inline Confirmation) */}
                    {confirmingDeleteId === task.id ? (
                        <div data-delete-confirm-id={task.id} className="flex items-center gap-1 animate-in slide-in-from-right-2 duration-200">
                            {/* Confirm Delete (Check) */}
                            <button
                                onClick={(e) => { e.stopPropagation(); finalDeleteTask(task.id); }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className={theme.task.deleteConfirmBtn}
                                title="삭제 확인"
                            >
                                <Check className={theme.category?.actionButton ? theme.category.actionButton.icon : "w-3 h-3"} />
                            </button>
                            {/* Cancel Delete (X) */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(null); }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className={theme.task.deleteCancelBtn}
                                title="취소"
                            >
                                <X className={theme.category?.actionButton ? theme.category.actionButton.icon : "w-3 h-3"} />
                            </button>
                        </div>
                    ) : (
                        /* Normal Delete Button */
                        <button
                            onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(task.id); }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={theme.category?.actionButton ? theme.category.actionButton.button : theme.task.deleteBtn}
                            title="삭제"
                        >
                            <Trash2 className={theme.category?.actionButton ? theme.category.actionButton.icon : "w-3 h-3"} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
});

export default TaskItem;

import React, { memo } from 'react';
import {
    Trash2, X, Check, Edit2, Clock, CheckCircle2, Circle
} from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';

const TaskItem = memo(({
    task, index, provided, snapshot,
    currentTheme, theme, isMiniMode,
    fontSize,
    getTextSizeClass, getSubTextSizeClass, formatTimeDisplay,
    category, borderIdle, borderHover, CATEGORY_ICON_HUES,
    toggleTask,
    editingTaskId, startEditing, saveEditing, cancelEditing,
    editingText, setEditingText,
    editingDate, setEditingDate,
    editingHour, setEditingHour,
    editingMinute, setEditingMinute,
    editingAmpm, setEditingAmpm,
    confirmingDeleteId, setConfirmingDeleteId, finalDeleteTask,
    notifications,
    editFormRef
}) => {
    return (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
                ...provided.draggableProps.style,
                '--border-idle': borderIdle,
                '--border-hover': borderHover,
                '--icon-color': CATEGORY_ICON_HUES[category.colorTheme] || '#FB7185'
            }}
            onClick={() => { if (editingTaskId !== task.id) toggleTask(task.id) }}
            className={`${theme.category.taskItem} ${isMiniMode ? '!mx-0 !mb-1 !p-1.5 last:!mb-0' : ''} cursor-pointer active:cursor-grabbing relative ${task.completed ? 'opacity-60' : ''} ${snapshot.isDragging ? 'shadow-lg z-50 ' + (currentTheme === 'princess' ? 'border-[#F472B6] scale-105' : 'bg-slate-800 ring-1 ring-indigo-500/50') : ''}`}
        >
            {currentTheme === 'excel' ? (
                <div className="relative w-4 h-4 flex items-center justify-center bg-white border border-[#217346] cursor-pointer hover:bg-[#E1E1E1] transition-colors"
                    onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                >
                    {task.completed && <Check className="w-3 h-3 text-[#217346]" strokeWidth={3} />}
                </div>
            ) : (
                <button
                    onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                    className={`mt-0.5 flex-shrink-0 transition-colors ${task.completed ? (currentTheme === 'princess' ? 'text-[var(--border-hover)]' : 'text-green-500') : (currentTheme === 'princess' ? 'text-[var(--icon-color)] opacity-60 hover:opacity-100' : 'text-slate-600 group-hover:text-indigo-400')}`}
                >
                    {task.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </button>
            )}

            <div className="flex-1 flex flex-col min-w-0 text-left">
                {editingTaskId === task.id ? (
                    /* ✨ SIMPLE EDIT TASK INTERFACE */
                    <div ref={editFormRef} className={`w-full relative transition-all duration-300 z-10
            ${currentTheme === 'princess'
                            ? 'bg-white p-2 sm:p-3 rounded-[16px] border-[1.5px] border-[#FFC0CB] shadow-sm mb-2 mt-1' // ✨ Dynamic Padding
                            : (currentTheme === 'excel'
                                ? 'bg-white border border-[#217346] shadow-md p-0 mb-4'
                                : 'bg-[#252526] border border-[#007ACC] shadow-2xl p-4 rounded mb-4 font-mono')
                        }`} onClick={e => e.stopPropagation()}>

                        {/* 1. Top Input Area */}
                        <div className={`${currentTheme === 'excel' ? 'bg-[#F3F2F1] p-2' : ''}`}>
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
                                className={`w-full bg-transparent focus:outline-none transition-all
                  ${currentTheme === 'princess'
                                        ? 'text-sm text-slate-600 font-normal bg-[#FFF0F5] border border-transparent focus:bg-white focus:border-[#FFB6C1] rounded-[8px] px-3 py-2'
                                        : (currentTheme === 'excel'
                                            ? 'text-sm font-sans text-slate-800 bg-white border border-[#D1D1D1] px-3 py-2 focus:border-[#217346]'
                                            : 'text-sm text-[#D4D4D4] bg-[#3C3C3C] p-2 border border-[#3E3E42] focus:border-[#007ACC]')}
                `}
                                placeholder={currentTheme === 'excel' ? '할 일을 수정하세요...' : "Edit task..."}
                            />
                        </div>

                        {/* 2. Controls Row - Mobile First Vertical Stack */}
                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 
              ${currentTheme === 'excel' ? 'bg-[#F3F2F1] border-t border-[#D1D1D1] p-2 mt-0' : 'mt-2'}`}>

                            {/* Left: Date/Time */}
                            <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-1 sm:gap-2 w-full sm:w-auto
                ${currentTheme === 'princess' ? 'bg-white border border-[#FFC0CB] px-1.5 sm:px-2 py-1 rounded-[10px]' : ''}`}>
                                <CustomDatePicker
                                    value={editingDate}
                                    onChange={(e) => setEditingDate(e.target.value)}
                                    placeholder="Date"
                                    inputClassName={`bg-transparent text-center focus:outline-none cursor-pointer
                    ${currentTheme === 'princess'
                                            ? 'text-[#FF6B81] font-medium text-[10px] sm:text-xs min-w-[60px] sm:min-w-[70px] placeholder-pink-300'
                                            : (currentTheme === 'excel' ? 'w-24 text-xs p-1 bg-white border border-[#D1D1D1]' : 'w-24 text-xs bg-[#1E1E1E] text-[#CE9178] border-none')}`}
                                    currentTheme={currentTheme}
                                />

                                {currentTheme === 'princess' && <span className="text-pink-200 text-[10px] hidden sm:inline">|</span>}

                                <div className="flex items-center gap-0.5">
                                    <input
                                        type="text"
                                        value={editingHour}
                                        onChange={(e) => setEditingHour(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="12" maxLength={2}
                                        className={`w-4 sm:w-5 text-center bg-transparent focus:outline-none 
                       ${currentTheme === 'princess' ? 'text-slate-600 font-medium text-[10px] sm:text-xs' : (currentTheme === 'excel' ? 'bg-white border border-[#D1D1D1] h-6 text-xs' : 'text-[#D19A66] text-xs')}`}
                                    />
                                    <span className={`${currentTheme === 'princess' ? 'text-pink-300 text-[10px] sm:text-xs' : 'text-slate-400'}`}>:</span>
                                    <input
                                        type="text"
                                        value={editingMinute}
                                        onChange={(e) => setEditingMinute(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="00" maxLength={2}
                                        className={`w-4 sm:w-5 text-center bg-transparent focus:outline-none 
                       ${currentTheme === 'princess' ? 'text-slate-600 font-medium text-[10px] sm:text-xs' : (currentTheme === 'excel' ? 'bg-white border border-[#D1D1D1] h-6 text-xs' : 'text-[#D19A66] text-xs')}`}
                                    />
                                    <button
                                        onClick={() => setEditingAmpm(p => p === '오전' ? '오후' : '오전')}
                                        className={`ml-1 flex items-center justify-center transition-all bg-transparent
                      ${currentTheme === 'princess'
                                                ? 'px-1 py-0.5 rounded bg-[#FF6B81] text-white text-[8px] sm:text-[9px] font-medium'
                                                : (currentTheme === 'excel' ? 'px-1 bg-white border border-[#D1D1D1] text-[10px] h-6' : 'text-[#569CD6] text-xs')}`}
                                    >
                                        {editingAmpm === '오전' ? 'AM' : 'PM'}
                                    </button>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                                <button
                                    onClick={cancelEditing}
                                    className={`transition-all flex items-center justify-center flex-1 sm:flex-none
                    ${currentTheme === 'princess'
                                            ? 'h-8 sm:w-7 sm:h-7 rounded-[8px] bg-slate-100 text-slate-400 hover:bg-slate-200 text-xs font-bold'
                                            : (currentTheme === 'excel'
                                                ? 'w-full sm:w-auto px-4 py-1 bg-white border border-[#D1D1D1] hover:bg-slate-100 text-xs text-slate-700'
                                                : 'w-full sm:w-auto px-3 py-1 text-[#ABB2BF] hover:bg-[#3E3E42] text-xs rounded')}`}
                                >
                                    {currentTheme === 'excel' ? 'Cancel' : (currentTheme === 'developer' ? '[ESC]' : (isMiniMode ? '취소' : <X className="w-4 h-4" />))}
                                </button>
                                <button
                                    onClick={() => saveEditing(task.id)}
                                    className={`transition-all flex items-center justify-center flex-1 sm:flex-none
                    ${currentTheme === 'princess'
                                            ? 'h-8 sm:w-7 sm:h-7 rounded-[8px] bg-[#FF6B81] text-white hover:bg-[#FF4757] shadow-sm text-xs font-bold'
                                            : (currentTheme === 'excel'
                                                ? 'w-full sm:w-auto px-4 py-1 bg-[#107C41] text-white border border-[#107C41] hover:bg-[#0E6032] text-xs font-bold'
                                                : 'w-full sm:w-auto px-3 py-1 bg-[#007ACC] text-white text-xs rounded hover:bg-[#0062A3]')}`}
                                >
                                    {currentTheme === 'excel' ? 'Save' : (currentTheme === 'developer' ? '[ENTER]' : (isMiniMode ? '저장' : <Check className="w-4 h-4 stroke-[2.5px]" />))}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <span
                            className={`break-words leading-snug ${task.completed ? 'line-through opacity-50' : ''} 
                            ${(isMiniMode && (currentTheme === 'developer' || currentTheme === 'excel'))
                                    ? 'text-xs'
                                    : getTextSizeClass(fontSize)}
                            ${currentTheme === 'princess' ? 'text-slate-600 font-medium' : (currentTheme === 'excel' ? (task.completed ? 'text-[#555]' : 'text-[#000]') : (task.completed ? 'text-slate-500' : 'text-slate-300'))}`}
                        >
                            {task.text}
                        </span>
                        {/* 마감 시간 */}
                        {(task.dueTime || task.dueDate) && (
                            <span className={`flex items-center gap-1 mt-0.5 ${task.completed ? 'text-slate-600' :
                                (task.alerted && notifications.some(n => n.taskId === task.id)) ? 'text-red-400 font-bold animate-pulse' :
                                    (currentTheme === 'princess' ? 'text-slate-500 font-medium' : 'text-slate-500')
                                } 
                                ${(isMiniMode && (currentTheme === 'developer' || currentTheme === 'excel'))
                                    ? 'text-[10px]'
                                    : getSubTextSizeClass(fontSize)}`}>
                                <Clock className="w-2.5 h-2.5" />
                                {task.dueDate && <span className="mr-1">{task.dueDate.slice(5).replace('-', '/')}</span>}
                                {formatTimeDisplay(task.dueTime)}
                            </span>
                        )}
                    </>
                )}
            </div>

            {/* Action Buttons (Hover) */}
            {editingTaskId !== task.id && (
                <div className={`absolute right-5 flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 ${theme.category?.actionButton ? theme.category.actionButton.wrapper : 'gap-2'}`}>
                    {/* Edit Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); startEditing(task); }}
                        className={theme.category?.actionButton
                            ? `${theme.category.actionButton.button}`
                            : "p-1.5 text-indigo-300 hover:text-[#7C3AED] bg-indigo-500/10 hover:bg-[#E9D5FF] hover:border-[#C4B5FD] rounded-lg backdrop-blur-md border border-indigo-500/20 shadow-lg transition-all duration-200 ease-in-out"
                        }
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
                                className={theme.category?.actionButton
                                    ? `${theme.category.actionButton.button} text-red-500 border-red-500 hover:bg-red-500 hover:text-white`
                                    : "p-1.5 text-white bg-[#FF6B81] hover:bg-[#FF4757] rounded-lg shadow-lg"
                                }
                                title="삭제 확인"
                            >
                                <Check className={theme.category?.actionButton ? theme.category.actionButton.icon : "w-3 h-3"} />
                            </button>
                            {/* Cancel Delete (X) */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(null); }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className={theme.category?.actionButton
                                    ? `${theme.category.actionButton.button}`
                                    : "p-1.5 text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-lg"
                                }
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
                            className={theme.category?.actionButton
                                ? `${theme.category.actionButton.button}`
                                : "p-1.5 text-red-300 hover:text-[#DB2777] bg-red-500/10 hover:bg-[#FBCFE8] hover:border-[#F9A8D4] rounded-lg backdrop-blur-md border border-red-500/20 shadow-lg transition-all duration-200 ease-in-out"
                            }
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

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
                                placeholder={currentTheme === 'excel' ? '할 일을 수정하세요...' : "Edit task..."}
                            />
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
                        >
                            {task.text}
                        </span>
                        {/* 마감 시간 */}
                        {(task.dueTime || task.dueDate) && (
                            <span className={`flex items-center gap-1 mt-0.5 ${task.completed ? 'text-slate-600' :
                                (task.alerted && notifications.some(n => n.taskId === task.id)) ? 'text-red-400 font-bold animate-pulse' :
                                    theme.task.timeDefault
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

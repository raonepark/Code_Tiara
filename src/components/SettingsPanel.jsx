import React, { useState } from 'react';
import { Settings, Save, ChevronDown, Download, Upload, Menu, GripVertical, Check, X, Trash2, Plus, RotateCcw } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { THEME_CONFIG } from '../constants/themeConfig';

const SettingsPanel = ({
    isOpen, onClose, currentTheme, setCurrentTheme, theme,
    focusDuration, setFocusDuration, breakDuration, setBreakDuration,
    fontSize, setFontSize, categories, onDragEndCategories,
    activePicker, setActivePicker, updateCategory, addCategory,
    confirmingCategoryDeleteId, setConfirmingCategoryDeleteId,
    finalDeleteCategory, categoryToDelete, setCategoryToDelete,
    confirmDeleteCategory, exportData, triggerImport, fileInputRef,
    importData, handleResetRequest, isResetConfirming, getIcon
}) => {
    const [isThemeSettingsExpanded, setIsThemeSettingsExpanded] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-300 flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-md mx-auto w-full space-y-4">

                {/* 🏷️ Header */}
                <div className="flex justify-between items-center mb-2">
                    <h2 className={`text-xl font-bold flex items-center gap-1.5 ${currentTheme === 'princess' ? 'text-[#FF6B81] font-[Gaegu]' : (currentTheme === 'excel' ? 'text-[#217346]' : 'text-slate-100')}`}>
                        <Settings className={`w-5 h-5 ${currentTheme === 'princess' ? 'text-[#FF6B81]' : (currentTheme === 'excel' ? 'text-[#217346]' : 'text-indigo-500')}`} />
                        {currentTheme === 'princess' ? '설정' : (currentTheme === 'excel' ? '환경 설정' : 'Settings')}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className={`flex items-center gap-1 text-xs px-3 py-1.5 transition-all shadow-sm font-bold
              ${currentTheme === 'princess'
                                    ? 'bg-slate-100 text-slate-400 hover:bg-slate-200 rounded-full border border-slate-200'
                                    : (currentTheme === 'excel'
                                        ? 'bg-white hover:bg-[#F3F2F1] text-slate-600 rounded-none border border-[#D1D1D1]'
                                        : (currentTheme === 'developer'
                                            ? 'bg-transparent hover:bg-[#E06C75]/10 text-[#5C6370] hover:text-[#E06C75] border border-transparent hover:border-[#E06C75] rounded-none font-mono'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full'
                                        )
                                    )
                                }`}
                        >
                            {currentTheme === 'developer' ? '[ESC]' : <X className="w-3.5 h-3.5" />}
                            {currentTheme === 'developer' ? '' : '취소'}
                        </button>
                        <button
                            onClick={onClose}
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
                </div>

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
    );
};

export default SettingsPanel;

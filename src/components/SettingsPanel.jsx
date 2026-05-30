import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Save, ChevronDown, Download, Upload, Menu, GripVertical, Check, X, Trash2, Plus, RotateCcw, Edit2, BookOpen } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { THEME_CONFIG } from '../constants/themeConfig';

const FONTS_LIST = [
    { id: 'default', labelKey: 'settings.font_default' },
    { id: 'Pretendard', labelKey: 'settings.font_pretendard' },
    { id: 'Gamja Flower', labelKey: 'settings.font_gamja' },
    { id: 'Gaegu', labelKey: 'settings.font_gaegu' },
    { id: 'Single Day', labelKey: 'settings.font_single_day' },
    { id: 'Jua', labelKey: 'settings.font_jua' },
    { id: 'Dongle', labelKey: 'settings.font_dongle' },
    { id: 'Nanum Gothic', labelKey: 'settings.font_nanum_gothic' },
    { id: 'Nanum Myeongjo', labelKey: 'settings.font_nanum_myeongjo' },
    { id: 'Nanum Pen Script', labelKey: 'settings.font_nanum_pen' }
];

const SettingsPanel = ({
    isOpen, onClose, currentTheme, setCurrentTheme, theme,
    projectTitle, setProjectTitle, defaultTitle,
    focusDuration, setFocusDuration, breakDuration, setBreakDuration,
    fontSize, setFontSize, fontFamily, setFontFamily, categories, onDragEndCategories,
    activePicker, setActivePicker, updateCategory, addCategory,
    confirmingCategoryDeleteId, setConfirmingCategoryDeleteId,
    finalDeleteCategory, categoryToDelete, setCategoryToDelete,
    confirmDeleteCategory, exportData, triggerImport, fileInputRef, importData,
    handleResetRequest, isResetConfirming, getIcon, openOnboardingGuide,
    user, onSignOut, onLoginClick, onDeleteAccount
}) => {
    const { t, i18n } = useTranslation();
    const [isThemeSettingsExpanded, setIsThemeSettingsExpanded] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
    const nameInputRef = useRef(null);

    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
        }
    }, [isEditingName]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isFontDropdownOpen && !event.target.closest('.font-select-dropdown')) {
                setIsFontDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isFontDropdownOpen]);

    if (!isOpen) return null;

    return (
        <div className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-300 flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-md mx-auto w-full space-y-4">
                {/* 🏷️ Header */}
                <div className="flex justify-between items-center mb-2">
                    <h2 className={`text-xl font-bold flex items-center gap-1.5 ${theme.titleText}`}>
                        <Settings className={`w-5 h-5 ${theme.titleText.split(' ')[0]}`} />
                        {t('settings.title')}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className={`flex items-center gap-1 text-xs px-3 py-1.5 transition-all shadow-sm font-bold ${theme.buttons.closeBtn}`}
                        >
                            {currentTheme === 'developer' ? '[ESC]' : <X className="w-3.5 h-3.5" />}
                            {currentTheme === 'developer' ? '' : t('settings.close')}
                        </button>

                    </div>
                </div>



                {/* 📝 Board Name Card */}
                <div className={theme.settings.wrapper}>
                    <div className={theme.settings.header}>
                        {t('settings.boardName')}
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditingName ? (
                            <input
                                ref={nameInputRef}
                                type="text"
                                value={projectTitle}
                                onChange={(e) => setProjectTitle(e.target.value)}
                                onBlur={() => setIsEditingName(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') setIsEditingName(false);
                                    if (e.key === 'Escape') setIsEditingName(false);
                                }}
                                className={`flex-1 ${theme.settings.input} transition-all`}
                                placeholder={defaultTitle || 'My Board'}
                            />
                        ) : (
                            <div
                                onClick={() => setIsEditingName(true)}
                                className={`flex-1 flex items-center justify-between cursor-pointer group px-3 py-2 transition-all ${currentTheme === 'developer'
                                    ? 'bg-[#1E1E1E] border border-[#3E3E42] text-[#ABB2BF] hover:border-[#61AFEF]'
                                    : currentTheme === 'excel'
                                        ? 'bg-white border border-[#D1D1D1] text-[#000] hover:border-[#217346]'
                                        : 'bg-white border-[1.5px] border-[#FFC0CB] rounded-[30px] text-slate-600 hover:border-[#FF6B81]'
                                    }`}
                            >
                                <span className={`text-sm font-bold truncate ${
                                    currentTheme === 'princess' && projectTitle === (defaultTitle || 'My Board')
                                        ? 'text-[#FF6B81]'
                                        : ''
                                }`}>
                                    {currentTheme === 'princess' && projectTitle === (defaultTitle || 'My Board')
                                        ? <>{t('app.my_diary')} <span className="text-xs">🎀</span></>
                                        : projectTitle
                                    }
                                </span>
                                <Edit2 className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                                    currentTheme === 'developer' ? 'text-[#61AFEF]'
                                        : currentTheme === 'excel' ? 'text-[#217346]'
                                            : 'text-[#FF6B81]'
                                }`} />
                            </div>
                        )}
                    </div>
                </div>

                {/* 🎨 Theme Settings Card - Unified (Collapsible) */}
                <div className={theme.settings.wrapper}>
                    <div
                        onClick={() => setIsThemeSettingsExpanded(!isThemeSettingsExpanded)}
                        className={`flex items-center justify-between cursor-pointer ${theme.settings.header.replace('mb-3', 'mb-0')}`} // Remove bottom margin if collapsed
                    >
                        <div className="flex items-center gap-2">
                            <span>{t('settings.themeSettings')}</span>
                            {!isThemeSettingsExpanded && (
                                <span className={`text-[10px] font-normal px-2 py-0.5 rounded-full ${theme.themeBadge}`}>
                                    {theme.themeIcon} {theme.label}
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
                                    className={`flex-1 flex flex-col items-center justify-center p-3 transition-all duration-300 ease-in-out border focus:outline-none text-[10px] sm:text-xs ${currentTheme === key ? theme.themeSelectorActive : theme.themeSelectorInactive}`}
                                >
                                    <span className="text-xl mb-1">{THEME_CONFIG[key].themeIcon}</span>
                                    <span className="text-[10px] font-bold">{THEME_CONFIG[key].label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ⏰ Timer & Font Card - Unified */}
                <div className={theme.settings.wrapper}>
                    <div className={theme.settings.header}>
                        {t('settings.timerAndFont')}
                    </div>

                    {/* Timer Flex */}
                    <div className="flex gap-3 mb-4">
                        <div className="flex-1">
                            <label className={`text-xs block mb-1 font-bold ml-1 ${theme.settings.sectionTitle}`}>{t('settings.focusMin')}</label>
                            <input
                                type="number"
                                value={focusDuration}
                                onChange={(e) => setFocusDuration(Number(e.target.value))}
                                className={`w-full ${theme.settings.input} transition-all`}
                            />
                        </div>
                        <div className="flex-1">
                            <label className={`text-xs block mb-1 font-bold ml-1 ${theme.settings.sectionTitle}`}>{t('settings.breakMin')}</label>
                            <input
                                type="number"
                                value={breakDuration}
                                onChange={(e) => setBreakDuration(Number(e.target.value))}
                                className={`w-full ${theme.settings.input} transition-all`}
                            />
                        </div>
                    </div>

                    {/* Font Size */}
                    <div className={`pt-3 border-t ${theme.divider} mb-4`}>
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <span className={`text-xs font-bold ${theme.settings.sectionTitle}`}>{t('settings.textSize')}</span>
                            <span className={`text-xs font-bold ${currentTheme === 'princess' ? 'text-[#FF6B81]' : (currentTheme === 'excel' ? 'text-[#217346]' : 'text-[#61AFEF]')}`}>{fontSize}px</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="10"
                                max="28"
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer ${
                                    currentTheme === 'princess' ? 'bg-[#FFD1DC] accent-[#FF6B81]' : 
                                    currentTheme === 'excel' ? 'bg-[#E1E1E1] accent-[#217346]' : 
                                    'bg-[#3E3E42] accent-[#61AFEF]'
                                }`}
                            />
                        </div>
                        {/* Quick Presets */}
                        <div className="flex gap-1.5 mt-2 justify-between">
                            {[12, 14, 16, 18, 22].map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setFontSize(size)}
                                    className={`flex-1 py-1 text-[10px] transition-all font-bold rounded-[8px] border focus:outline-none ${
                                        fontSize === size
                                            ? (currentTheme === 'princess' ? 'bg-[#FF6B81] border-[#FF6B81] text-white' : (currentTheme === 'excel' ? 'bg-[#217346] border-[#217346] text-white' : 'bg-[#61AFEF] border-[#61AFEF] text-slate-900'))
                                            : (currentTheme === 'princess' ? 'bg-white border-[#FFD1DC] text-[#FFB6C1] hover:bg-[#FFF0F5]' : (currentTheme === 'excel' ? 'bg-[#F3F2F1] border-[#D1D1D1] text-slate-600 hover:bg-[#E1E1E1]' : 'bg-[#2D2D30] border-transparent text-slate-400 hover:text-white'))
                                    }`}
                                >
                                    {size === 12 ? t('settings.sizeSmall') : size === 14 ? t('settings.sizeDefault') : size === 16 ? t('settings.sizeMedium') : size === 18 ? t('settings.sizeLarge') : t('settings.sizeXLarge')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Font Family */}
                    <div className={`pt-3 border-t ${theme.divider}`}>
                        <div className={`text-xs mb-2 font-bold ml-1 ${theme.settings.sectionTitle}`}>
                            {t('settings.fontSelection')}
                        </div>
                        <div className="relative font-select-dropdown">
                            <button
                                type="button"
                                onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                                className={`w-full ${theme.settings.input} text-sm transition-all focus:outline-none flex justify-between items-center py-2 px-3 border border-pink-200/50 shadow-sm`}
                                style={fontFamily !== 'default' ? { fontFamily: `'${fontFamily}', sans-serif` } : {}}
                            >
                                <span>{FONTS_LIST.find(f => f.id === fontFamily)?.labelKey ? t(FONTS_LIST.find(f => f.id === fontFamily).labelKey) : t('settings.font_default')}</span>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isFontDropdownOpen ? 'rotate-180' : ''} ${currentTheme === 'princess' ? 'text-[#FF6B81]' : (currentTheme === 'excel' ? 'text-[#217346]' : 'text-slate-400')}`} />
                            </button>
                            
                            {isFontDropdownOpen && (
                                <div 
                                    className={`absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto z-50 shadow-xl border custom-scrollbar transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
                                        currentTheme === 'princess' 
                                            ? 'bg-white/95 backdrop-blur-md border-[#FFD1DC] rounded-[16px] text-slate-800' 
                                            : (currentTheme === 'excel' 
                                                ? 'bg-[#F3F2F1] border-[#D1D1D1] text-slate-800' 
                                                : 'bg-[#252526] border-[#3E3E42] text-[#D4D4D4] rounded-lg')
                                    }`}
                                >
                                    {FONTS_LIST.map(f => {
                                        const isSelected = fontFamily === f.id;
                                        let hoverClass = '';
                                        if (currentTheme === 'princess') {
                                            hoverClass = isSelected ? 'bg-[#FFE4E1] text-[#FF6B81]' : 'hover:bg-[#FFF0F5] text-slate-700';
                                        } else if (currentTheme === 'excel') {
                                            hoverClass = isSelected ? 'bg-[#E1DFDD] text-[#217346]' : 'hover:bg-[#EDEBE9] text-slate-700';
                                        } else {
                                            hoverClass = isSelected ? 'bg-[#007ACC] text-white' : 'hover:bg-[#2D2D30] text-[#ABB2BF]';
                                        }

                                        return (
                                            <button
                                                key={f.id}
                                                type="button"
                                                onClick={() => {
                                                    setFontFamily(f.id);
                                                    setIsFontDropdownOpen(false);
                                                }}
                                                className={`w-full text-left py-2 px-3 text-xs sm:text-sm font-medium transition-colors flex flex-col gap-0.5 border-b last:border-b-0 font-preview-item ${
                                                    currentTheme === 'princess' ? 'border-[#FFF0F5]' : (currentTheme === 'excel' ? 'border-[#E1E1E1]' : 'border-[#2D2D30]')
                                                } ${hoverClass}`}
                                                style={{ fontFamily: f.id === 'default' ? "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif" : `'${f.id}', sans-serif` }}
                                            >
                                                <span className="font-semibold">{t(f.labelKey)}</span>
                                                <span className="text-[10px] opacity-60">
                                                    {f.id === 'default' ? t('settings.font_preview_default') : t('settings.font_preview_text')}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 💾 Data & Category Card - Unified */}
                <div className={theme.settings.wrapper}>
                    <div className={theme.settings.header}>
                        {t('settings.dataBackupRestore')}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={exportData}
                            className={`flex flex-col items-center justify-center p-3 transition-all group ${theme.settings.button.default} hover:-translate-y-0.5`}
                        >
                            <Download className="w-5 h-5 mb-1" /> <span className="text-xs font-bold">{t('settings.backup')}</span>
                        </button>
                        <button onClick={triggerImport}
                            className={`flex flex-col items-center justify-center p-3 transition-all group ${theme.settings.button.default} hover:-translate-y-0.5`}
                        >
                            <Upload className="w-5 h-5 mb-1" /> <span className="text-xs font-bold">{t('settings.restore')}</span>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />
                    </div>
                </div>

                {/* 🎨 Unified Category Management (All Themes use 'Editable Row') */}
                <div className={`p-3 border-t ${theme.divider}`}>
                    <div className={`text-sm mb-2 font-bold ${theme.settings.sectionTitle}`}>{t('settings.categoryManagement')}</div>
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
                                                    className={`relative transition-colors duration-200 group flex items-center ${theme.settings.listRow.wrapper} ${currentTheme === 'excel' ? (index % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F9]') : ''} ${activePicker?.id === cat.id ? 'z-50' : 'z-0'} ${snapshot.isDragging ? 'shadow-lg z-[100]' : ''}`}
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
                    <button onClick={addCategory} className={`w-full mt-3 py-2 text-xs font-bold flex items-center justify-center gap-1 transition-all ${theme.buttons.outlineBtn}`}>
                        <Plus className="w-3.5 h-3.5" /> <span className="text-xs font-bold">{t('settings.add')}</span>
                    </button>
                </div>
            </div>

            {/* 🌐 Language Settings */}
            <div className={`mt-6 pt-6 border-t ${theme.divider} max-w-md mx-auto`}>
                <div className={theme.settings.wrapper}>
                    <div className={theme.settings.header}>
                        {t('settings.language')}
                    </div>
                    <div className="relative font-select-dropdown">
                        <select
                            value={i18n.language?.startsWith('en') ? 'en' : 'ko'}
                            onChange={(e) => i18n.changeLanguage(e.target.value)}
                            className={`w-full ${theme.settings.input} text-sm transition-all focus:outline-none py-2 px-3 appearance-none cursor-pointer`}
                        >
                            <option value="ko">{t('settings.langKo')} (Korean)</option>
                            <option value="en">{t('settings.langEn')} (English)</option>
                        </select>
                        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none ${currentTheme === 'princess' ? 'text-[#FF6B81]' : (currentTheme === 'excel' ? 'text-[#217346]' : 'text-slate-400')}`} />
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t ${theme.divider} mt-6 max-w-md mx-auto`}>
                <button
                    onClick={openOnboardingGuide}
                    className={`text-xs px-4 py-2 transition-all font-bold flex items-center justify-center gap-2 ${theme.buttons.outlineBtn} w-full sm:w-auto`}
                >
                    <BookOpen className="w-3.5 h-3.5" />
                    {t('settings.userGuide')}
                </button>
                {user && user.uid === "guest_user" ? (
                    <button
                        onClick={onLoginClick}
                        className={`text-xs px-4 py-2 transition-all font-bold flex items-center justify-center gap-2 ${theme.buttons.outlineBtn} w-full sm:w-auto`}
                    >
                        <span className={theme.iconType === 'table' ? "opacity-100" : ""}>🔑</span> {t('settings.login')}
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => { if(onSignOut) onSignOut(); onClose(); }}
                            className={`text-xs px-4 py-2 transition-all font-bold flex items-center justify-center gap-2 ${theme.buttons.outlineBtn} w-full sm:w-auto`}
                        >
                            <span className={theme.iconType === 'table' ? "opacity-100" : ""}>🚪</span> {t('settings.logout')}
                        </button>
                        <button
                            onClick={onDeleteAccount}
                            className={`text-xs px-4 py-2 transition-all font-bold flex items-center justify-center gap-2 ${theme.buttons.dangerBtn} w-full sm:w-auto`}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t('settings.deleteAccount')}
                        </button>
                    </>
                )}
                <button
                    onClick={handleResetRequest}
                    className={`text-xs px-4 py-2 transition-all font-bold flex items-center justify-center gap-2 ${isResetConfirming ? 'bg-red-600 text-white animate-pulse shadow-lg scale-105 ' + theme.radius : theme.buttons.dangerBtn} w-full sm:w-auto`}
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {isResetConfirming ? t('settings.areYouSure') : t('settings.reset')}
                </button>
            </div>

            {/* 🏷️ Version Info */}
            <div className={`text-center mt-5 text-[10px] opacity-40 select-none ${
                currentTheme === 'developer' ? 'font-mono' : currentTheme === 'princess' ? 'font-gamja font-bold' : 'font-sans'
            }`}>
                {currentTheme === 'developer' ? '// version 1.7.0' : `${t('settings.version')} 1.7.0`}
            </div>


        </div>
    );
};

export default SettingsPanel;

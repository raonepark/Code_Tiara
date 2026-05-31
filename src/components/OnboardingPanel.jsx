import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, X, Sparkles, Layers, Clock, BookOpen } from 'lucide-react';

const OnboardingPanel = ({ currentTheme, theme, user, onClose }) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);

  const slides = [
    {
      title: t('onboarding.title1'),
      subtitle: t('onboarding.subtitle1'),
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF6B81] to-[#FFE4E1] shadow-md animate-float-slow will-change-transform">
            <span className="text-4xl">👑</span>
            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-[#FFD700] animate-pulse" />
          </div>
          <p className="text-sm leading-relaxed px-4 opacity-90">
            <strong>{t('onboarding.desc1_bold')}</strong>{t('onboarding.desc1')}
          </p>
        </div>
      )
    },
    {
      title: t('onboarding.title2'),
      subtitle: t('onboarding.subtitle2'),
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="relative w-36 h-24 bg-gradient-to-br from-amber-100 to-yellow-200 border border-yellow-300 rounded shadow-md p-2 flex flex-col justify-between text-left transform rotate-1 hover:rotate-0 transition-transform will-change-transform">
            <div className="w-2 h-2 bg-red-400 rounded-full mx-auto -mt-1.5 shadow-sm"></div>
            <div className="space-y-1 mt-1">
              <div className="h-1.5 w-16 bg-amber-400 rounded-full"></div>
              <div className="h-1.5 w-24 bg-amber-300 rounded-full"></div>
              <div className="h-1.5 w-20 bg-amber-300 rounded-full"></div>
            </div>
            <div className="flex justify-between items-center text-[8px] text-amber-600 font-mono">
              <span>📍 ALWAYS ON TOP</span>
              <Layers className="w-2.5 h-2.5" />
            </div>
          </div>
          <p className="text-sm leading-relaxed px-2 opacity-90">
            {t('onboarding.desc2_1')}<strong>{t('onboarding.desc2_bold')}</strong>{t('onboarding.desc2_2')}
          </p>
        </div>
      )
    },
    {
      title: t('onboarding.title3'),
      subtitle: t('onboarding.subtitle3'),
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-dashed border-[#FF6B81] animate-spin-slow will-change-transform">
            <Clock className="w-10 h-10 text-[#FF6B81] animate-pulse" />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#FF6B81] rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          <p className="text-sm leading-relaxed px-3 opacity-90">
            {t('onboarding.desc3_1')}<strong>{t('onboarding.desc3_bold')}</strong>{t('onboarding.desc3_2')}
          </p>
        </div>
      )
    },
    {
      title: t('onboarding.title4'),
      subtitle: t('onboarding.subtitle4'),
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="flex flex-nowrap justify-center gap-1.5 w-full px-2">
            <div className="py-1.5 px-2.5 rounded border border-[#FFC0CB] bg-[#FFF0F5] text-[10px] font-bold text-[#FF6B81] flex items-center justify-center gap-1 whitespace-nowrap">
              <span>👑</span><span>Princess</span>
            </div>
            <div className="py-1.5 px-2.5 rounded border border-[#D1D5DB] bg-[#F3F2F1] text-[10px] font-bold text-[#217346] flex items-center justify-center gap-1 whitespace-nowrap">
              <span>📊</span><span>Excel</span>
            </div>
            <div className="py-1.5 px-2.5 rounded border border-[#3E3E42] bg-[#282C34] text-[10px] font-bold text-[#61AFEF] flex items-center justify-center gap-1 whitespace-nowrap">
              <span>💻</span><span>Developer</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed px-3 opacity-90">
            {t('onboarding.desc4_1')}<strong>{t('onboarding.desc4_bold1')}</strong>{t('onboarding.desc4_2')}<strong>{t('onboarding.desc4_bold2')}</strong>{t('onboarding.desc4_3')}<strong>{t('onboarding.desc4_bold3')}</strong>{t('onboarding.desc4_4')}
          </p>
        </div>
      )
    },
    {
      title: t('onboarding.title5'),
      subtitle: t('onboarding.subtitle5'),
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-[#3E8BFF] to-[#DCEBFF] shadow-md animate-pulse will-change-transform">
            <span className="text-4xl">☁️</span>
          </div>
          <p className="text-sm leading-relaxed px-3 opacity-90">
            {t('onboarding.desc5_1')}<strong>{t('onboarding.desc5_bold')}</strong>{t('onboarding.desc5_2')}
          </p>
        </div>
      )
    }
  ];

  const handleStart = () => {
    const userId = user?.uid || 'guest_user';
    localStorage.setItem(`lumora_onboarding_completed_${userId}`, 'true');
    localStorage.setItem('lumora_onboarding_completed', 'true');
    // Notify windows of storage change manually in case storage event doesn't fire locally immediately
    window.dispatchEvent(new Event('storage'));
    onClose();
  };

  const handleClose = () => {
    const userId = user?.uid || 'guest_user';
    localStorage.setItem(`lumora_onboarding_completed_${userId}`, 'true');
    localStorage.setItem('lumora_onboarding_completed', 'true');
    window.dispatchEvent(new Event('storage'));
    onClose();
  };

  const nextSlide = () => {
    if (currentPage < slides.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Theme-specific styles
  const isPrincess = currentTheme === 'princess';
  const isExcel = currentTheme === 'excel';
  const isDeveloper = currentTheme === 'developer';

  const containerBg = isPrincess
    ? 'bg-[#FFFCFD] border-2 border-[#FFC0CB] rounded-2xl shadow-[0_8px_30px_rgba(255,182,193,0.3)]'
    : isExcel
      ? 'bg-white border border-[#D1D1D1] rounded-none shadow-md'
      : isDeveloper
        ? 'bg-[#1E1E1E] border border-[#3E3E42] text-[#ABB2BF] rounded-none shadow-lg'
        : 'bg-white border border-slate-200 rounded-xl shadow-lg';

  const headerBg = isPrincess
    ? 'bg-[#FFF0F5] border-b border-[#FFC0CB]/30 text-[#FF6B81]'
    : isExcel
      ? 'bg-[#217346] text-white border-b border-[#1e6b41]'
      : isDeveloper
        ? 'bg-[#21252B] text-[#61AFEF] border-b border-[#3E424B]'
        : 'bg-slate-50 text-slate-800 border-b border-slate-100';

  const fontClass = isPrincess
    ? 'font-gamja font-bold'
    : isDeveloper
      ? 'font-mono'
      : 'font-sans';

  const dotActive = isPrincess
    ? 'bg-[#FF6B81]'
    : isExcel
      ? 'bg-[#217346]'
      : isDeveloper
        ? 'bg-[#61AFEF]'
        : 'bg-slate-800';

  const dotInactive = isPrincess
    ? 'bg-pink-100'
    : isExcel
      ? 'bg-slate-300'
      : isDeveloper
        ? 'bg-[#3E4451]'
        : 'bg-slate-200';

  const btnSecondary = isPrincess
    ? 'bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full'
    : isExcel
      ? 'bg-white border border-[#D1D5DB] hover:bg-[#F3F2F1] text-slate-700'
      : isDeveloper
        ? 'bg-[#282C34] border border-[#3E3E42] text-[#ABB2BF] hover:bg-[#3E4451]'
        : 'bg-slate-100 hover:bg-slate-200 text-slate-700';

  const btnPrimary = isPrincess
    ? 'bg-[#FF6B81] hover:bg-[#FF5271] text-white rounded-full font-bold shadow-sm'
    : isExcel
      ? 'bg-[#107C41] hover:bg-[#0E6032] text-white border border-[#107C41] font-bold'
      : isDeveloper
        ? 'bg-transparent border border-[#61AFEF] text-[#61AFEF] hover:bg-[#61AFEF]/10 font-bold'
        : 'bg-slate-800 hover:bg-slate-900 text-white font-bold';

  return (
    <div 
      className={`h-screen w-screen flex flex-col overflow-hidden select-none ${containerBg} ${fontClass}`}
      style={{ WebkitAppRegion: 'drag' }}
    >
      {/* 📖 frameless header dragging region & close */}
      <div className={`px-3.5 h-10 flex items-center justify-between shrink-0 select-none ${headerBg}`}>
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{isDeveloper ? 'MANUAL.md' : t('onboarding.userGuide')}</span>
        </div>
        <button
          onClick={handleClose}
          className={`p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer flex items-center justify-center`}
          style={{ WebkitAppRegion: 'no-drag' }}
          title={t('onboarding.close')}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Slide Content Area */}
      <div 
        className="flex-1 p-5 flex flex-col justify-between overflow-y-auto custom-scrollbar" 
        style={{ WebkitAppRegion: 'no-drag', transform: 'translateZ(0)' }}
      >
        <div className="space-y-4 my-auto">
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className={`text-base font-bold tracking-wide ${isPrincess ? 'text-[#FF6B81] text-lg font-[Gaegu]' : isExcel ? 'text-[#217346]' : isDeveloper ? 'text-[#E06C75]' : 'text-slate-800'}`}>
              {slides[currentPage].title}
            </h2>
            <p className={`text-[11px] opacity-75 uppercase tracking-wider`}>
              {slides[currentPage].subtitle}
            </p>
          </div>

          {/* Main Visual & Text */}
          <div className="py-2 flex items-center justify-center min-h-[170px]">
            {slides[currentPage].content}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="space-y-3 shrink-0 mt-4">
          {/* Carousel Dots */}
          <div className="flex justify-center gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentPage === i ? `${dotActive} w-3` : dotInactive}`}
              />
            ))}
          </div>

          {/* Buttons Row */}
          <div className="flex justify-between items-center gap-2">
            <button
              onClick={prevSlide}
              disabled={currentPage === 0}
              className={`px-3 py-1.5 text-xs flex items-center gap-1 transition-all ${btnSecondary} ${currentPage === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{isDeveloper ? 'PREV' : t('onboarding.prev')}</span>
            </button>

            {currentPage === slides.length - 1 ? (
              <button
                onClick={handleStart}
                className={`px-4 py-1.5 text-xs flex items-center gap-1.5 transition-all ${btnPrimary}`}
              >
                <span>{isDeveloper ? 'START' : t('onboarding.start')}</span>
              </button>
            ) : (
              <button
                onClick={nextSlide}
                className={`px-4 py-1.5 text-xs flex items-center gap-1 transition-all ${btnPrimary}`}
              >
                <span>{isDeveloper ? 'NEXT' : t('onboarding.next')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations style block */}
      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float-slow {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -6px, 0); }
        }
      `}</style>
    </div>
  );
};

export default OnboardingPanel;

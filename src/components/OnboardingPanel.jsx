import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Sparkles, Layers, Clock, BookOpen } from 'lucide-react';

const OnboardingPanel = ({ currentTheme, theme, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const slides = [
    {
      title: '반가워요! 코드 티아라 👑',
      subtitle: '나만의 감성으로 완성하는 할 일 관리',
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF6B81] to-[#FFE4E1] shadow-md animate-bounce duration-1000">
            <span className="text-4xl">👑</span>
            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-[#FFD700] animate-pulse" />
          </div>
          <p className="text-sm leading-relaxed px-4 opacity-90">
            <strong>코드 티아라</strong>는 바쁜 일상을 아름답게 조율할 수 있도록 돕는 감성 할 일 관리 앱입니다. 포스트잇 형태의 메모 보드로 한눈에 할 일을 정리해 보세요!
          </p>
        </div>
      )
    },
    {
      title: '포스트잇 & 분리 모드 📌',
      subtitle: '바탕화면에 나만의 할 일 보드 고정',
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="relative w-36 h-24 bg-gradient-to-br from-amber-100 to-yellow-200 border border-yellow-300 rounded shadow-md p-2 flex flex-col justify-between text-left transform rotate-1 hover:rotate-0 transition-transform">
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
            각 카테고리 헤더의 <strong>'팝업으로 분리(Pop-out)'</strong> 아이콘을 눌러보세요. 독립된 작은 창으로 떼어내어 화면 원하는 곳에 배치하고, 항상 위에 띄워두고 쓸 수 있습니다.
          </p>
        </div>
      )
    },
    {
      title: '집중을 돕는 포커스 타이머 ⏱️',
      subtitle: '뽀모도로 기법으로 생산성 극대화',
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-dashed border-[#FF6B81] animate-spin-slow">
            <Clock className="w-10 h-10 text-[#FF6B81] animate-pulse" />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#FF6B81] rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          <p className="text-sm leading-relaxed px-3 opacity-90">
            집중 시간과 휴식 시간을 번갈아 기록하는 <strong>포커스 타이머</strong>가 내장되어 있습니다. 타이머 역시 개별 팝업 창으로 떼어내어 보면서 작업할 수 있습니다.
          </p>
        </div>
      )
    },
    {
      title: '감성 테마와 커스터마이징 🎨',
      subtitle: '취향 저격 폰트와 테마 설정',
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="grid grid-cols-3 gap-2 w-full px-4">
            <div className="p-2 rounded border border-[#FFC0CB] bg-[#FFF0F5] text-[10px] font-bold text-[#FF6B81]">
              👑 Princess
            </div>
            <div className="p-2 rounded border border-[#D1D5DB] bg-[#F3F2F1] text-[10px] font-bold text-[#217346]">
              📊 Excel
            </div>
            <div className="p-2 rounded border border-[#3E3E42] bg-[#282C34] text-[10px] font-bold text-[#61AFEF] font-mono">
              💻 Developer
            </div>
          </div>
          <p className="text-sm leading-relaxed px-3 opacity-90">
            사랑스러운 <strong>공주 테마</strong>, 업무용 <strong>엑셀 테마</strong>, 세련된 <strong>개발자 테마</strong>까지 준비되어 있습니다. 전체 설정 창에서 폰트 종류와 크기, 카테고리별 컬러까지 자유롭게 디자인해보세요!
          </p>
        </div>
      )
    }
  ];

  const handleStart = () => {
    localStorage.setItem('lumora_onboarding_completed', 'true');
    // Notify windows of storage change manually in case storage event doesn't fire locally immediately
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
          <span>{isDeveloper ? 'MANUAL.md' : '사용 설명서'}</span>
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer flex items-center justify-center`}
          style={{ WebkitAppRegion: 'no-drag' }}
          title="닫기"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Slide Content Area */}
      <div 
        className="flex-1 p-5 flex flex-col justify-between overflow-y-auto custom-scrollbar" 
        style={{ WebkitAppRegion: 'no-drag' }}
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
              <span>{isDeveloper ? 'PREV' : '이전'}</span>
            </button>

            {currentPage === slides.length - 1 ? (
              <button
                onClick={handleStart}
                className={`px-4 py-1.5 text-xs flex items-center gap-1.5 transition-all ${btnPrimary}`}
              >
                <span>{isDeveloper ? 'START' : '시작하기'}</span>
              </button>
            ) : (
              <button
                onClick={nextSlide}
                className={`px-4 py-1.5 text-xs flex items-center gap-1 transition-all ${btnPrimary}`}
              >
                <span>{isDeveloper ? 'NEXT' : '다음'}</span>
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
      `}</style>
    </div>
  );
};

export default OnboardingPanel;

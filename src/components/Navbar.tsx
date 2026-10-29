import React from 'react';
import { useCanteen } from '../context/CanteenContext';
import { UtensilsCrossed, Database, Clock, ShoppingBag, ShieldCheck, MapPin } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentTab, setCurrentTab, activeSession, currentStudent, queueStats } = useCanteen();

  return (
    <header className="sticky top-0 z-40 bg-[#FCFBF7]/95 backdrop-blur-md border-b border-[#EBE7DD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-xs border border-emerald-200/60">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-gray-900 block leading-tight">
                CanteenFlow
              </span>
              <span className="text-[11px] font-medium text-emerald-700 tracking-wide block">
                Smart Queue & POS
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-line, unboxed, text with subtle hover states) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
          <button
            onClick={() => setCurrentTab('home')}
            className={`whitespace-nowrap transition-colors pb-0.5 ${
              currentTab === 'home'
                ? 'text-emerald-900 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setCurrentTab('student')}
            className={`whitespace-nowrap transition-colors pb-0.5 flex items-center gap-1.5 ${
              currentTab === 'student'
                ? 'text-emerald-900 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>Student Portal</span>
          </button>
          <button
            onClick={() => setCurrentTab('staff')}
            className={`whitespace-nowrap transition-colors pb-0.5 flex items-center gap-1.5 ${
              currentTab === 'staff'
                ? 'text-emerald-900 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Staff POS</span>
          </button>
          <button
            onClick={() => setCurrentTab('jdbc')}
            className={`whitespace-nowrap transition-colors pb-0.5 flex items-center gap-1.5 ${
              currentTab === 'jdbc'
                ? 'text-emerald-900 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-gray-900'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-700" />
            <span>JDBC Architecture</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action / Status Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          {activeSession ? (
            <button
              onClick={() => setCurrentTab('student')}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100/90 text-emerald-900 border border-emerald-300/80 rounded-lg text-xs font-semibold hover:bg-emerald-200/80 transition-colors shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Live Session: {activeSession.tokenNo || currentStudent.name.split(' ')[0]}</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-[#F4F0E6] px-2.5 py-1.5 rounded-lg border border-[#E5E0D3]">
              <Clock className="w-3.5 h-3.5 text-gray-600" />
              <span>Avg Wait: <strong className="text-gray-800 font-semibold tabular-nums">{queueStats.avgWaitTimeMins}m</strong></span>
              <span className="text-gray-300">·</span>
              <span>Serving: <strong className="text-emerald-800 font-semibold tabular-nums">#{queueStats.servingNowToken}</strong></span>
            </div>
          )}

          <button
            onClick={() => setCurrentTab('student')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-98 transition-all rounded-lg shadow-xs whitespace-nowrap"
          >
            Order Food
          </button>
        </div>
      </div>

      {/* Mobile nav bar row for easy phone access */}
      <div className="md:hidden flex items-center justify-around border-t border-[#EBE7DD] py-2 px-3 bg-[#FAF7F0] text-xs font-medium text-gray-600">
        <button
          onClick={() => setCurrentTab('home')}
          className={`py-1 px-2 rounded-md ${currentTab === 'home' ? 'text-emerald-900 font-bold bg-emerald-100/70' : ''}`}
        >
          Home
        </button>
        <button
          onClick={() => setCurrentTab('student')}
          className={`py-1 px-2 rounded-md ${currentTab === 'student' ? 'text-emerald-900 font-bold bg-emerald-100/70' : ''}`}
        >
          Student
        </button>
        <button
          onClick={() => setCurrentTab('staff')}
          className={`py-1 px-2 rounded-md ${currentTab === 'staff' ? 'text-emerald-900 font-bold bg-emerald-100/70' : ''}`}
        >
          Staff POS
        </button>
        <button
          onClick={() => setCurrentTab('jdbc')}
          className={`py-1 px-2 rounded-md ${currentTab === 'jdbc' ? 'text-emerald-900 font-bold bg-emerald-100/70' : ''}`}
        >
          JDBC
        </button>
      </div>
    </header>
  );
};

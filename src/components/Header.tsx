import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { 
  Trophy, 
  Calendar, 
  History, 
  BarChart2, 
  Moon, 
  Sun, 
  User, 
  Users, 
  FileSpreadsheet, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ShieldCheck,
  Award,
  Share2
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    logout,
    setIsLoginModalOpen,
    setIsAdminConsoleOpen,
    setIsSheetsSyncOpen,
    setIsShareModalOpen,
    matches,
  } = useTournament();

  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

  // Live and upcoming match counts
  const liveCount = matches.filter((m) => m.status === 'live').length;
  const upcomingCount = matches.filter((m) => m.status === 'upcoming').length;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('upcoming')}
              className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  KHEL
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400 leading-tight">
                  Championship '26
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links / Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'upcoming'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Upcoming & Live</span>
              {liveCount > 0 ? (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-sm tabular-nums animate-pulse">
                  {liveCount} LIVE
                </span>
              ) : upcomingCount > 0 ? (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                  ({upcomingCount})
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab('past')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'past'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Past Results</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Player Stats</span>
            </button>
          </nav>

          {/* Zone 3: User Controls & Tools */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Share & Publish Portal Trigger */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              title="Publish & Share Links (Cookie-Free)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share Portal</span>
            </button>

            {/* Google Sheets Sync Trigger */}
            <button
              onClick={() => setIsSheetsSyncOpen(true)}
              title="Google Sheets Live Sync"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            {/* Admin Console Trigger (Only visible to Admin) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setIsAdminConsoleOpen(true)}
                title="Tournament Director Console"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 rounded-lg transition-colors border border-amber-500/20"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Console</span>
              </button>
            )}

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Persona Switcher / User Profile Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-left transition-colors border border-slate-200/80 dark:border-slate-700/80"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs uppercase">
                    {currentUser.name.slice(0, 2)}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[120px] leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1">
                      {currentUser.role === 'admin' ? (
                        <ShieldCheck className="w-2.5 h-2.5 text-amber-500 inline" />
                      ) : currentUser.role === 'scorer' ? (
                        <Award className="w-2.5 h-2.5 text-blue-500 inline" />
                      ) : null}
                      {currentUser.role === 'admin' ? 'Director' : currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>

                {/* Dropdown Menu */}
                {isPersonaMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 text-xs"
                    onClick={() => setIsPersonaMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{currentUser.name}</p>
                      <p className="text-slate-500 text-[11px] tabular-nums">{currentUser.phoneNumber}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                        <span>{currentUser.teamName}</span>
                        <span>·</span>
                        <span className="capitalize">{currentUser.role}</span>
                      </div>
                    </div>


                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                      <button
                        onClick={() => setIsLoginModalOpen(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Login with another phone number</span>
                      </button>

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Secondary Tab Bar (Bottom anchored or inline subheader) */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 px-2 py-2 bg-slate-50 dark:bg-slate-900/90 text-xs">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-md ${
            activeTab === 'upcoming' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Upcoming</span>
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-md ${
            activeTab === 'past' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Past</span>
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-md ${
            activeTab === 'schedule' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule</span>
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-md ${
            activeTab === 'stats' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Stats</span>
        </button>
      </div>
    </header>
  );
};

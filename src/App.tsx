import React from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { Header } from './components/Header';
import { UpcomingMatches } from './components/UpcomingMatches';
import { PastMatches } from './components/PastMatches';
import { TournamentSchedule } from './components/TournamentSchedule';
import { PlayerStats } from './components/PlayerStats';
import { LoginModal } from './components/LoginModal';
import { ScoreEntryModal } from './components/ScoreEntryModal';
import { MatchDetailModal } from './components/MatchDetailModal';
import { AdminConsoleModal } from './components/AdminConsoleModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { ShareModal } from './components/ShareModal';
import { Trophy, ShieldCheck, Award } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, currentUser } = useTournament();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Dynamic Context Header Banner */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {activeTab === 'upcoming' && 'Championship Action & Upcoming Fixtures'}
              {activeTab === 'past' && 'Completed Results & Hall of Fame'}
              {activeTab === 'schedule' && 'Tournament Master Schedule'}
              {activeTab === 'stats' && 'Athlete Analytics & Medal Standings'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {activeTab === 'upcoming' && 'Follow live court updates, score in-progress games, and review upcoming clash times.'}
              {activeTab === 'past' && 'Complete breakdown of past victories, sets won, MVPs, and referee match notes.'}
              {activeTab === 'schedule' && 'Comprehensive chronological timeline across courts, pitches, and arenas.'}
              {activeTab === 'stats' && 'Olympic medal tally, career win percentages, and sport-by-sport performance metrics.'}
            </p>
          </div>

          {/* Role Status Tag */}
          {currentUser && (
            <div className="flex items-center gap-2 self-start sm:self-auto bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
              <span className="text-slate-400 font-medium">Signed in as:</span>
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {currentUser.role}
              </span>
            </div>
          )}
        </div>

        {/* Tab View Render */}
        {activeTab === 'upcoming' && <UpcomingMatches />}
        {activeTab === 'past' && <PastMatches />}
        {activeTab === 'schedule' && <TournamentSchedule />}
        {activeTab === 'stats' && <PlayerStats />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Khel — Sports Championship Tournament Portal</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Corporate & Athletic League Edition</span>
            <span>·</span>
            <span>Role-Based Access Control</span>
            <span>·</span>
            <span>Live Sheets Synchronization</span>
          </div>
        </div>
      </footer>

      {/* Global Interactive Modals */}
      <LoginModal />
      <ScoreEntryModal />
      <MatchDetailModal />
      <AdminConsoleModal />
      <GoogleSheetsSyncModal />
      <ShareModal />
    </div>
  );
};

export default function App() {
  return (
    <TournamentProvider>
      <MainContent />
    </TournamentProvider>
  );
}

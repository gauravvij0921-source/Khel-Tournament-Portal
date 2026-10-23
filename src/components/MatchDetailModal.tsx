import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { getSportCategory } from '../data/sportsData';
import { 
  X, 
  Trophy, 
  Calendar, 
  Clock, 
  MapPin, 
  Award, 
  Star, 
  CheckCircle2, 
  Edit3,
  Users,
  Activity
} from 'lucide-react';

export const MatchDetailModal: React.FC = () => {
  const { activeDetailMatch, setActiveDetailMatch, canUserScore, setActiveScoreMatch } = useTournament();

  if (!activeDetailMatch) return null;

  const sport = getSportCategory(activeDetailMatch.sportId);
  const isFinals = activeDetailMatch.matchName.toLowerCase().includes('final');
  const userCanScore = canUserScore(activeDetailMatch);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
              {activeDetailMatch.eventCode}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {sport.name}
            </span>
          </div>

          <button
            onClick={() => setActiveDetailMatch(null)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Stage & Status Banner */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{activeDetailMatch.matchName}</span>
                {isFinals && <span className="text-amber-500">🏆</span>}
              </div>
              <div className="text-xs text-slate-500">
                {activeDetailMatch.eventType} Championship Bracket
              </div>
            </div>

            <div>
              {activeDetailMatch.status === 'live' ? (
                <span className="px-3 py-1 text-xs font-bold bg-rose-500 text-white rounded-lg animate-pulse">
                  LIVE IN PLAY
                </span>
              ) : activeDetailMatch.status === 'completed' ? (
                <span className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 rounded-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Finished</span>
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  Scheduled
                </span>
              )}
            </div>
          </div>

          {/* Teams Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700/60 space-y-4">
            {/* Team 1 */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {activeDetailMatch.team1Player1}
                </div>
                {activeDetailMatch.team1Player2 && (
                  <div className="text-xs text-slate-500">
                    Partner: {activeDetailMatch.team1Player2}
                  </div>
                )}
              </div>
              {activeDetailMatch.winner?.includes(activeDetailMatch.team1Player1) && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  <Trophy className="w-3.5 h-3.5" /> Winner
                </span>
              )}
            </div>

            {/* Score Highlight if available */}
            {activeDetailMatch.scores && (
              <div className="py-2.5 px-4 bg-white dark:bg-slate-900 rounded-xl text-center border border-slate-200 dark:border-slate-800">
                <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                  {activeDetailMatch.scores}
                </span>
              </div>
            )}

            {/* Team 2 */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {activeDetailMatch.team2Player1}
                </div>
                {activeDetailMatch.team2Player2 && (
                  <div className="text-xs text-slate-500">
                    Partner: {activeDetailMatch.team2Player2}
                  </div>
                )}
              </div>
              {activeDetailMatch.winner?.includes(activeDetailMatch.team2Player1) && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  <Trophy className="w-3.5 h-3.5" /> Winner
                </span>
              )}
            </div>
          </div>

          {/* Set Scores Breakdown Table if applicable */}
          {activeDetailMatch.setScores && activeDetailMatch.setScores.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Set Breakdown
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {activeDetailMatch.setScores.map((s) => (
                  <div
                    key={s.setNumber}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-center border border-slate-200/60 dark:border-slate-700"
                  >
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      Set {s.setNumber}
                    </div>
                    <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                      {s.team1Score} - {s.team2Score}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule Specs Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date
              </span>
              <p className="font-semibold text-slate-900 dark:text-white font-mono">
                {activeDetailMatch.date}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3" /> Scheduled Time
              </span>
              <p className="font-semibold text-slate-900 dark:text-white font-mono">
                {activeDetailMatch.startTime} - {activeDetailMatch.endTime} ({activeDetailMatch.matchDurationMin}m)
              </p>
            </div>

            <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Venue / Court
              </span>
              <p className="font-semibold text-slate-900 dark:text-white">
                {activeDetailMatch.venue}
              </p>
            </div>
          </div>

          {/* Stats: MVP & Highlights */}
          {activeDetailMatch.stats && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {activeDetailMatch.stats.mvp && (
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">
                      Player of the Match
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {activeDetailMatch.stats.mvp}
                    </p>
                  </div>
                </div>
              )}

              {activeDetailMatch.stats.notes && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Match Notes & Highlights
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 italic">
                    "{activeDetailMatch.stats.notes}"
                  </p>
                </div>
              )}

              {/* Rallies or speed */}
              {(activeDetailMatch.stats.longestRally || activeDetailMatch.stats.runRateOrSpeed) && (
                <div className="flex items-center justify-between text-slate-500 text-[11px] px-1">
                  {activeDetailMatch.stats.longestRally && (
                    <span>Longest Rally: <strong>{activeDetailMatch.stats.longestRally} shots</strong></span>
                  )}
                  {activeDetailMatch.stats.runRateOrSpeed && (
                    <span>Metrics: <strong>{activeDetailMatch.stats.runRateOrSpeed}</strong></span>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <button
            onClick={() => setActiveDetailMatch(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
          >
            Close
          </button>

          {userCanScore && (
            <button
              onClick={() => {
                const matchToScore = activeDetailMatch;
                setActiveDetailMatch(null);
                setActiveScoreMatch(matchToScore);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{activeDetailMatch.status === 'completed' ? 'Edit Score' : 'Score Match'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

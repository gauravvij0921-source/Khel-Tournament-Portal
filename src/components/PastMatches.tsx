import React, { useState, useMemo } from 'react';
import { useTournament } from '../context/TournamentContext';
import { SPORTS_CATEGORIES, getSportCategory } from '../data/sportsData';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  Edit3, 
  Info,
  Star,
  Search
} from 'lucide-react';
import { Match } from '../types';

export const PastMatches: React.FC = () => {
  const {
    matches,
    currentUser,
    canUserScore,
    setActiveScoreMatch,
    setActiveDetailMatch,
    selectedSportFilter,
    setSelectedSportFilter,
  } = useTournament();

  const [searchQuery, setSearchQuery] = useState('');

  // All completed matches
  const completedMatches = useMemo(() => {
    return matches.filter((m) => m.status === 'completed');
  }, [matches]);

  // Filtered completed matches
  const filteredMatches = useMemo(() => {
    return completedMatches.filter((match) => {
      if (selectedSportFilter !== 'all' && match.sportId !== selectedSportFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          match.eventCode,
          match.matchName,
          match.team1Player1,
          match.team1Player2,
          match.team2Player1,
          match.team2Player2,
          match.winner,
          match.venue,
          match.stats?.mvp,
          match.scores,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }, [completedMatches, selectedSportFilter, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Controls: Sport selector & Search */}
      <div className="space-y-4">
        {/* Sport Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setSelectedSportFilter('all')}
            className={`px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
              selectedSportFilter === 'all'
                ? 'border-amber-500 text-slate-900 dark:text-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Sports ({completedMatches.length})
          </button>

          {SPORTS_CATEGORIES.map((sport) => {
            const count = completedMatches.filter((m) => m.sportId === sport.id).length;
            const isSelected = selectedSportFilter === sport.id;

            return (
              <button
                key={sport.id}
                onClick={() => setSelectedSportFilter(sport.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  isSelected
                    ? 'border-amber-500 text-slate-900 dark:text-white font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{sport.name}</span>
                <span className="text-[11px] opacity-70 tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Filter bar: Search & summary */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 text-xs">
            Showing <strong className="text-slate-900 dark:text-white">{filteredMatches.length}</strong> archived results
          </span>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search past results, winner, MVP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 w-52 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Award className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No completed matches in this category
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Matches will appear here as soon as scores are finalized by scorers or directors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((match) => {
            const sport = getSportCategory(match.sportId);
            const userCanScore = canUserScore(match);
            const isTeam1Winner = match.winner?.includes(match.team1Player1);
            const isTeam2Winner = match.winner?.includes(match.team2Player1);

            return (
              <div
                key={match.id}
                className="flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
              >
                <div>
                  {/* Top Bar: Event Code, Sport, Stage */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                        {sport.name}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-[10px]">{match.eventCode}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{match.matchName} Final</span>
                    </div>
                  </div>

                  {/* Contestants and Score Display */}
                  <div className="py-4 space-y-3">
                    {/* Team 1 */}
                    <div className={`p-2.5 rounded-xl transition-colors ${
                      isTeam1Winner
                        ? 'bg-amber-500/10 border border-amber-500/20'
                        : 'bg-transparent'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isTeam1Winner && (
                            <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <div className={`text-sm ${isTeam1Winner ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                            {match.team1Player1}
                            {match.team1Player2 && ` & ${match.team1Player2}`}
                          </div>
                        </div>
                        {isTeam1Winner && (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            Winner
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Final Score Banner */}
                    <div className="bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl text-center border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {match.scores || 'Scores Recorded'}
                      </span>
                      
                      {/* Set-by-set pills if applicable */}
                      {match.setScores && match.setScores.length > 0 && (
                        <div className="flex items-center justify-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                          {match.setScores.map((set) => (
                            <span key={set.setNumber} className="bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                              S{set.setNumber}: {set.team1Score}-{set.team2Score}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Team 2 */}
                    <div className={`p-2.5 rounded-xl transition-colors ${
                      isTeam2Winner
                        ? 'bg-amber-500/10 border border-amber-500/20'
                        : 'bg-transparent'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isTeam2Winner && (
                            <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <div className={`text-sm ${isTeam2Winner ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                            {match.team2Player1}
                            {match.team2Player2 && ` & ${match.team2Player2}`}
                          </div>
                        </div>
                        {isTeam2Winner && (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            Winner
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* MVP / Player of the match banner */}
                  {match.stats?.mvp && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs mb-3">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                      <div className="truncate text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-slate-900 dark:text-white">MVP: </span>
                        <span>{match.stats.mvp}</span>
                      </div>
                    </div>
                  )}

                  {/* Match Notes / Highlight */}
                  {match.stats?.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2 mb-3">
                      "{match.stats.notes}"
                    </p>
                  )}
                </div>

                {/* Footer metadata & buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {match.date}
                    </span>
                    <span className="truncate max-w-[150px]">{match.venue}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setActiveDetailMatch(match)}
                      className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Full Match Report
                    </button>

                    {userCanScore && (
                      <button
                        onClick={() => setActiveScoreMatch(match)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Score</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

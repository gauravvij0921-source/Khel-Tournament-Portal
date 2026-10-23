import React, { useState, useMemo } from 'react';
import { useTournament } from '../context/TournamentContext';
import { SPORTS_CATEGORIES, getSportCategory } from '../data/sportsData';
import { 
  Trophy, 
  Clock, 
  MapPin, 
  Play, 
  Edit3, 
  Info, 
  Filter, 
  Calendar, 
  UserCheck, 
  Users,
  Flame,
  ChevronRight
} from 'lucide-react';
import { Match } from '../types';

export const UpcomingMatches: React.FC = () => {
  const {
    matches,
    currentUser,
    canUserScore,
    setActiveScoreMatch,
    setActiveDetailMatch,
    selectedSportFilter,
    setSelectedSportFilter,
  } = useTournament();

  const [dateFilter, setDateFilter] = useState<string>('all');
  const [onlyMyMatches, setOnlyMyMatches] = useState<boolean>(currentUser?.role === 'player');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract all distinct dates from upcoming/live matches
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    matches
      .filter((m) => m.status === 'upcoming' || m.status === 'live')
      .forEach((m) => dates.add(m.date));
    return Array.from(dates).sort();
  }, [matches]);

  // Separate live matches for top highlight banner
  const liveMatches = useMemo(() => {
    return matches.filter((m) => m.status === 'live');
  }, [matches]);

  // Filtered upcoming matches
  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      // Must be upcoming or live
      if (match.status === 'completed') return false;

      // Sport filter
      if (selectedSportFilter !== 'all' && match.sportId !== selectedSportFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all' && match.date !== dateFilter) {
        return false;
      }

      // Only my matches filter (for logged in player or scorer)
      if (onlyMyMatches && currentUser) {
        const userName = currentUser.name.toLowerCase();
        const isInMatch =
          match.team1Player1.toLowerCase().includes(userName) ||
          (match.team1Player2 && match.team1Player2.toLowerCase().includes(userName)) ||
          match.team2Player1.toLowerCase().includes(userName) ||
          (match.team2Player2 && match.team2Player2.toLowerCase().includes(userName)) ||
          match.team1Player1.toLowerCase().includes(currentUser.teamName.toLowerCase()) ||
          match.team2Player1.toLowerCase().includes(currentUser.teamName.toLowerCase());

        if (!isInMatch && currentUser.role === 'player') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          match.eventCode,
          match.sportId,
          match.matchName,
          match.team1Player1,
          match.team1Player2,
          match.team2Player1,
          match.team2Player2,
          match.venue,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }, [matches, selectedSportFilter, dateFilter, onlyMyMatches, currentUser, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Live Action Spotlight Banner */}
      {liveMatches.length > 0 && (
        <section aria-labelledby="live-spotlight-heading" className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-5 border border-slate-800 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-5" />
              <h2 id="live-spotlight-heading" className="text-sm font-bold tracking-wide uppercase text-rose-400">
                Live Match In Progress
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {liveMatches.length} active match{liveMatches.length > 1 ? 'es' : ''} on court
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveMatches.map((liveMatch) => {
              const sport = getSportCategory(liveMatch.sportId);
              const userCanScore = canUserScore(liveMatch);

              return (
                <div
                  key={liveMatch.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-400 uppercase tracking-wide">
                      {sport.name} · {liveMatch.matchName}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {liveMatch.startTime} ({liveMatch.matchDurationMin}m)
                    </span>
                  </div>

                  {/* Team vs Team Live Display */}
                  <div className="space-y-1.5 my-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white truncate max-w-[200px]">
                        {liveMatch.team1Player1}
                        {liveMatch.team1Player2 && ` & ${liveMatch.team1Player2}`}
                      </span>
                    </div>
                    <div className="text-center text-xs font-bold text-rose-400 bg-slate-900/60 py-1.5 px-3 rounded-lg font-mono border border-slate-700">
                      {liveMatch.scores || '0 - 0 (In Play)'}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-300 truncate max-w-[200px]">
                        {liveMatch.team2Player1}
                        {liveMatch.team2Player2 && ` & ${liveMatch.team2Player2}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                    <span className="text-slate-400 truncate flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-500" /> {liveMatch.venue}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveDetailMatch(liveMatch)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        Info
                      </button>

                      {userCanScore ? (
                        <button
                          onClick={() => setActiveScoreMatch(liveMatch)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition-colors shadow-xs"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Update Score</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Live Scoring Active</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Control Bar: Sport Selector, Filters, and "My Matches" Switch */}
      <div className="space-y-4">
        {/* Sport Category Segmented Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setSelectedSportFilter('all')}
            className={`px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
              selectedSportFilter === 'all'
                ? 'border-amber-500 text-slate-900 dark:text-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Sports ({matches.filter((m) => m.status !== 'completed').length})
          </button>

          {SPORTS_CATEGORIES.map((sport) => {
            const count = matches.filter((m) => m.sportId === sport.id && m.status !== 'completed').length;
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

        {/* Secondary Filter Row: Date Pills, Search, Athlete Switch */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Date Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date:
            </span>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                dateFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              All Dates
            </button>
            {availableDates.map((d) => (
              <button
                key={d}
                onClick={() => setDateFilter(d)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors tabular-nums ${
                  dateFilter === d
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Right Group: Search & Athlete Toggle */}
          <div className="flex items-center gap-3 ml-auto">
            {currentUser && (
              <button
                onClick={() => setOnlyMyMatches(!onlyMyMatches)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                  onlyMyMatches
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>My Matches ({currentUser.name.split(' ')[0]})</span>
              </button>
            )}

            <input
              type="text"
              placeholder="Search athlete, team, court..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Match Cards Grid */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Trophy className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No upcoming fixtures found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {onlyMyMatches
              ? `There are no scheduled matches for ${currentUser?.name}. Try toggling off "My Matches" to view all championship games.`
              : 'Check back later or adjust the sport and date filters.'}
          </p>
          {onlyMyMatches && (
            <button
              onClick={() => setOnlyMyMatches(false)}
              className="mt-3 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-lg hover:bg-amber-500/20"
            >
              Show all championship fixtures
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((match) => {
            const sport = getSportCategory(match.sportId);
            const userCanScore = canUserScore(match);
            const isFinals = match.matchName.toLowerCase().includes('final');

            return (
              <div
                key={match.id}
                className={`flex flex-col justify-between bg-white dark:bg-slate-900 border rounded-2xl p-5 transition-shadow hover:shadow-md ${
                  isFinals
                    ? 'border-amber-400/80 dark:border-amber-500/50 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header: Stage, Event Code, Sport Label */}
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                        {sport.name}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-[10px]">{match.eventCode}</span>
                    </div>

                    {isFinals ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40">
                        🏆 GOLD FINAL
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {match.matchName} · {match.eventType}
                      </span>
                    )}
                  </div>

                  {/* Match Teams / Players */}
                  <div className="py-4 space-y-3">
                    {/* Team 1 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {match.team1Player1.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {match.team1Player1}
                          </div>
                          {match.team1Player2 && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              & {match.team1Player2}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                      <span>VS</span>
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>

                    {/* Team 2 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {match.team2Player1.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {match.team2Player1}
                          </div>
                          {match.team2Player2 && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              & {match.team2Player2}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer: Date, Time, Venue, and Action Button */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" /> {match.date}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" /> {match.startTime} - {match.endTime} ({match.matchDurationMin}m)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 truncate text-slate-400">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{match.venue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setActiveDetailMatch(match)}
                      className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Match Details
                    </button>

                    {userCanScore ? (
                      <button
                        onClick={() => setActiveScoreMatch(match)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition-colors shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Score Match</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {currentUser ? 'Scores view-only for player' : 'Sign in to score'}
                      </span>
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

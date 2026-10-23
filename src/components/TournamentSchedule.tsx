import React, { useState, useMemo } from 'react';
import { useTournament } from '../context/TournamentContext';
import { SPORTS_CATEGORIES, getSportCategory } from '../data/sportsData';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  Download, 
  Filter, 
  Trophy, 
  CheckCircle2, 
  Play,
  ArrowRight
} from 'lucide-react';
import { EventType, Match } from '../types';
import { exportMatchesToCSV, downloadFile } from '../utils/csvHelper';

export const TournamentSchedule: React.FC = () => {
  const {
    matches,
    selectedSportFilter,
    setSelectedSportFilter,
    setActiveDetailMatch,
    setActiveScoreMatch,
    canUserScore,
  } = useTournament();

  const [eventTypeFilter, setEventTypeFilter] = useState<'All' | EventType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter matches
  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      if (selectedSportFilter !== 'all' && match.sportId !== selectedSportFilter) {
        return false;
      }

      if (eventTypeFilter !== 'All' && match.eventType !== eventTypeFilter) {
        return false;
      }

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
  }, [matches, selectedSportFilter, eventTypeFilter, searchQuery]);

  // Group chronologically by date
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: Match[] } = {};
    // Sort all filtered matches chronologically by date and start time
    const sorted = [...filteredMatches].sort((a, b) => {
      const cmpDate = a.date.localeCompare(b.date);
      if (cmpDate !== 0) return cmpDate;
      return a.startTime.localeCompare(b.startTime);
    });

    sorted.forEach((m) => {
      if (!groups[m.date]) {
        groups[m.date] = [];
      }
      groups[m.date].push(m);
    });

    return groups;
  }, [filteredMatches]);

  const dates = Object.keys(groupedByDate).sort();

  const handleExportCSV = () => {
    const csv = exportMatchesToCSV(filteredMatches);
    downloadFile(csv, `khel-schedule-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      
      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        {/* Sport and Event Type Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sport dropdown */}
          <select
            value={selectedSportFilter}
            onChange={(e) => setSelectedSportFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Sports ({matches.length})</option>
            {SPORTS_CATEGORIES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Event Type selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
            {(['All', 'Singles', 'Doubles', 'Team'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setEventTypeFilter(type)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  eventTypeFilter === type
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Export Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search schedule, athlete, venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <button
            onClick={handleExportCSV}
            title="Download Schedule CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Chronological Schedule List */}
      {dates.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Calendar className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No fixtures match the selected schedule criteria
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Try resetting your sport or event type filter.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {dates.map((dateStr) => {
            const dayMatches = groupedByDate[dateStr];
            const dateObj = new Date(dateStr);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div key={dateStr} className="space-y-3">
                {/* Date Header */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="h-px flex-1 bg-slate-200 dark:border-slate-800" />
                  <span className="text-xs text-slate-400 font-mono">
                    {dayMatches.length} fixture{dayMatches.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Timeline table / cards */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
                  {dayMatches.map((match) => {
                    const sport = getSportCategory(match.sportId);
                    const userCanScore = canUserScore(match);
                    const isFinals = match.matchName.toLowerCase().includes('final');

                    return (
                      <div
                        key={match.id}
                        className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Time & Sport Column */}
                        <div className="flex items-start sm:items-center gap-3 min-w-[190px]">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xs shrink-0">
                            {sport.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{match.startTime} - {match.endTime}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <span>{sport.name}</span>
                              <span>·</span>
                              <span className="font-mono text-[10px]">{match.eventCode}</span>
                              <span>·</span>
                              <span>{match.matchDurationMin}m</span>
                            </div>
                          </div>
                        </div>

                        {/* Match Competitors & Stage */}
                        <div className="flex-1 min-w-[240px]">
                          <div className="flex items-center gap-2 mb-1">
                            {isFinals ? (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded">
                                🏆 Gold Medal Final
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {match.matchName} · {match.eventType}
                              </span>
                            )}
                          </div>

                          <div className="text-sm font-semibold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                            <span>
                              {match.team1Player1}
                              {match.team1Player2 && ` & ${match.team1Player2}`}
                            </span>
                            <span className="text-xs text-slate-400 font-normal">vs</span>
                            <span>
                              {match.team2Player1}
                              {match.team2Player2 && ` & ${match.team2Player2}`}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{match.venue}</span>
                          </div>
                        </div>

                        {/* Status, Score, & Action */}
                        <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                          {/* Status Badge */}
                          <div>
                            {match.status === 'live' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500 text-white animate-pulse">
                                LIVE
                              </span>
                            ) : match.status === 'completed' ? (
                              <div className="text-right">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="w-3 h-3" /> Result In
                                </span>
                                {match.scores && (
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    {match.scores}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                Scheduled
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setActiveDetailMatch(match)}
                              className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              Details
                            </button>

                            {userCanScore && (
                              <button
                                onClick={() => setActiveScoreMatch(match)}
                                className="px-2.5 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition-colors shadow-xs"
                              >
                                {match.status === 'completed' ? 'Edit' : 'Score'}
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

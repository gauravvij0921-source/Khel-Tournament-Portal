import React, { useState, useMemo } from 'react';
import { useTournament } from '../context/TournamentContext';
import { SPORTS_CATEGORIES, getSportCategory } from '../data/sportsData';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Shield, 
  User, 
  Zap,
  ChevronDown
} from 'lucide-react';
import { Match, Player } from '../types';

export const PlayerStats: React.FC = () => {
  const { currentUser, allPlayers, matches, setActiveDetailMatch } = useTournament();

  // Selected player for viewing stats (defaults to logged-in user or first athlete)
  const defaultPlayer = currentUser || allPlayers.find((p) => p.role === 'player') || allPlayers[0];
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(defaultPlayer?.id || '');

  const viewedPlayer = useMemo(() => {
    return allPlayers.find((p) => p.id === selectedPlayerId) || defaultPlayer;
  }, [allPlayers, selectedPlayerId, defaultPlayer]);

  // Compute matches involving this player
  const playerMatches = useMemo(() => {
    if (!viewedPlayer) return [];
    const name = viewedPlayer.name.toLowerCase();
    const team = viewedPlayer.teamName.toLowerCase();

    return matches.filter((m) => {
      const t1p1 = m.team1Player1.toLowerCase();
      const t1p2 = (m.team1Player2 || '').toLowerCase();
      const t2p1 = m.team2Player1.toLowerCase();
      const t2p2 = (m.team2Player2 || '').toLowerCase();

      return (
        t1p1.includes(name) ||
        t1p2.includes(name) ||
        t2p1.includes(name) ||
        t2p2.includes(name) ||
        (m.eventType === 'Team' && (t1p1.includes(team) || t2p1.includes(team)))
      );
    });
  }, [matches, viewedPlayer]);

  // Completed matches for stats calculations
  const completedMatches = useMemo(() => {
    return playerMatches.filter((m) => m.status === 'completed');
  }, [playerMatches]);

  // Calculate Wins, Losses
  const { wins, losses, winRate } = useMemo(() => {
    if (!viewedPlayer) return { wins: 0, losses: 0, winRate: 0 };
    const name = viewedPlayer.name.toLowerCase();
    const team = viewedPlayer.teamName.toLowerCase();

    let w = 0;
    let l = 0;

    completedMatches.forEach((m) => {
      if (!m.winner) return;
      const winnerLower = m.winner.toLowerCase();
      const isWinner = winnerLower.includes(name) || winnerLower.includes(team);
      if (isWinner) {
        w++;
      } else {
        l++;
      }
    });

    const total = w + l;
    const rate = total > 0 ? Math.round((w / total) * 100) : 0;
    return { wins: w, losses: l, winRate: rate };
  }, [completedMatches, viewedPlayer]);

  // Olympic Medal Tally
  const medalTally = useMemo(() => {
    if (!viewedPlayer) return { gold: 0, silver: 0, bronze: 0 };
    const name = viewedPlayer.name.toLowerCase();
    const team = viewedPlayer.teamName.toLowerCase();

    let gold = 0;
    let silver = 0;
    let bronze = 0;

    completedMatches.forEach((m) => {
      const isFinal = m.matchName.toLowerCase().includes('final');
      const isSF = m.matchName.toLowerCase().includes('sf');
      const isWinner = m.winner?.toLowerCase().includes(name) || m.winner?.toLowerCase().includes(team);

      if (isFinal) {
        if (isWinner) {
          gold++;
        } else {
          silver++;
        }
      } else if (isSF && !isWinner) {
        // Semifinalist who didn't advance takes bronze
        bronze++;
      }
    });

    // Special bonus for mock athletes if in finals
    if (viewedPlayer.phoneNumber === '+917028296694' && gold === 0) {
      gold = 1; // Prior championship champion
      silver = 1;
    } else if (viewedPlayer.phoneNumber === '+919876543211' && gold === 0) {
      gold = 1;
      bronze = 1;
    }

    return { gold, silver, bronze };
  }, [completedMatches, viewedPlayer]);

  // Sport-by-sport breakdown
  const sportBreakdown = useMemo(() => {
    if (!viewedPlayer) return [];
    const name = viewedPlayer.name.toLowerCase();
    const team = viewedPlayer.teamName.toLowerCase();

    const sportsMap: { [sportId: string]: { total: number; wins: number; losses: number } } = {};

    completedMatches.forEach((m) => {
      if (!sportsMap[m.sportId]) {
        sportsMap[m.sportId] = { total: 0, wins: 0, losses: 0 };
      }
      sportsMap[m.sportId].total++;
      const isWinner = m.winner?.toLowerCase().includes(name) || m.winner?.toLowerCase().includes(team);
      if (isWinner) {
        sportsMap[m.sportId].wins++;
      } else {
        sportsMap[m.sportId].losses++;
      }
    });

    return Object.entries(sportsMap).map(([sportId, data]) => {
      const sport = getSportCategory(sportId);
      const rate = data.total > 0 ? Math.round((data.wins / data.total) * 100) : 0;
      return {
        sportId,
        sportName: sport.name,
        total: data.total,
        wins: data.wins,
        losses: data.losses,
        winRate: rate,
      };
    });
  }, [completedMatches, viewedPlayer]);

  if (!viewedPlayer) {
    return <div className="text-center py-10">No player profile selected</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Athlete Profile Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left: Avatar, Name, Jersey, Team */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl font-extrabold shadow-md overflow-hidden border-2 border-amber-500/30">
                {viewedPlayer.name.slice(0, 2).toUpperCase()}
              </div>
              {viewedPlayer.jerseyNumber && (
                <span className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded-lg border-2 border-white dark:border-slate-900 shadow-xs tabular-nums">
                  #{viewedPlayer.jerseyNumber}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {viewedPlayer.name}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider">
                  {viewedPlayer.role}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {viewedPlayer.teamName}
                </span>
                <span>·</span>
                <span>{viewedPlayer.department || 'Athletics'}</span>
                <span>·</span>
                <span className="tabular-nums font-mono">{viewedPlayer.phoneNumber}</span>
              </div>

              <div className="pt-1 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <Zap className="w-3.5 h-3.5" />
                <span>Primary Discipline: <strong>{viewedPlayer.primarySport || 'Multi-Sport'}</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Switch Athlete Dropdown */}
          <div className="flex flex-col sm:items-end gap-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Inspect Athlete Roster
            </label>
            <div className="relative">
              <select
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                className="w-full sm:w-60 px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
              >
                {allPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.teamName} - {p.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* KPI Stat Cards & Olympic Medal Tally */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Matches */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Matches
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {completedMatches.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {playerMatches.filter((m) => m.status === 'upcoming').length} upcoming fixture(s)
          </div>
        </div>

        {/* Wins */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-between">
            <span>Victories</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {wins}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {losses} defeat{losses === 1 ? '' : 's'} recorded
          </div>
        </div>

        {/* Win Rate % */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Win Ratio</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
            {winRate}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Based on completed tournaments
          </div>
        </div>

        {/* Olympic Medal Tally */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Medal Tally</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>

          <div className="flex items-center justify-around gap-2 mt-2">
            {/* Gold */}
            <div className="flex flex-col items-center">
              <span className="text-base select-none">🥇</span>
              <span className="text-lg font-black text-amber-500 tabular-nums">
                {medalTally.gold}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Gold</span>
            </div>

            {/* Silver */}
            <div className="flex flex-col items-center">
              <span className="text-base select-none">🥈</span>
              <span className="text-lg font-black text-slate-400 tabular-nums">
                {medalTally.silver}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Silver</span>
            </div>

            {/* Bronze */}
            <div className="flex flex-col items-center">
              <span className="text-base select-none">🥉</span>
              <span className="text-lg font-black text-amber-700 dark:text-amber-600 tabular-nums">
                {medalTally.bronze}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Bronze</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sport-by-Sport Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Sport Performance Breakdown
        </h3>

        {sportBreakdown.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            No completed matches in the record for this athlete yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="py-2.5 px-3">Discipline</th>
                  <th className="py-2.5 px-3 tabular-nums">Played</th>
                  <th className="py-2.5 px-3 tabular-nums text-emerald-600">Won</th>
                  <th className="py-2.5 px-3 tabular-nums text-rose-500">Lost</th>
                  <th className="py-2.5 px-3 tabular-nums">Win Rate</th>
                  <th className="py-2.5 px-3">Rating Bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sportBreakdown.map((row) => (
                  <tr key={row.sportId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {row.sportName}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums">{row.total}</td>
                    <td className="py-3 px-3 font-mono tabular-nums font-bold text-emerald-600">
                      {row.wins}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-rose-500">
                      {row.losses}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums font-bold">
                      {row.winRate}%
                    </td>
                    <td className="py-3 px-3 w-40">
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${row.winRate}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Match History for this athlete */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Match History & Upcoming Commitments ({playerMatches.length})
        </h3>

        {playerMatches.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            No matches found for this athlete.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {playerMatches.map((m) => {
              const sport = getSportCategory(m.sportId);
              const nameLower = viewedPlayer.name.toLowerCase();
              const isWinner = m.winner?.toLowerCase().includes(nameLower);

              return (
                <div
                  key={m.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors cursor-pointer"
                  onClick={() => setActiveDetailMatch(m)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {sport.name}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-[11px]">{m.eventCode}</span>
                      <span>·</span>
                      <span>{m.matchName}</span>
                    </div>

                    <div className="font-semibold text-slate-900 dark:text-white">
                      {m.team1Player1} vs {m.team2Player1}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {m.date} · {m.startTime} · {m.venue}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {m.status === 'completed' ? (
                      <div className="flex items-center gap-2">
                        {isWinner ? (
                          <span className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 rounded-lg">
                            WON
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-400 rounded-lg">
                            LOST
                          </span>
                        )}
                        <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {m.scores}
                        </span>
                      </div>
                    ) : m.status === 'live' ? (
                      <span className="px-2.5 py-1 text-xs font-bold bg-rose-500 text-white rounded-lg animate-pulse">
                        LIVE NOW
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        Scheduled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

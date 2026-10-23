import React, { useState, useEffect, useMemo } from 'react';
import { useTournament } from '../context/TournamentContext';
import { getSportCategory } from '../data/sportsData';
import { SetScore, MatchStats, MatchStatus } from '../types';
import { X, Plus, Trash2, Trophy, Award, Check, Sparkles, Clock, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ScoreEntryModal: React.FC = () => {
  const { activeScoreMatch, setActiveScoreMatch, updateMatchScore, allPlayers } = useTournament();

  if (!activeScoreMatch) return null;

  const sport = getSportCategory(activeScoreMatch.sportId);
  const isFinals = activeScoreMatch.matchName.toLowerCase().includes('final');

  // Form states based on scoring type
  // 1. Sets scoring (TT, Badminton)
  const [sets, setSets] = useState<SetScore[]>(() => {
    if (activeScoreMatch.setScores && activeScoreMatch.setScores.length > 0) {
      return activeScoreMatch.setScores;
    }
    return [
      { setNumber: 1, team1Score: 11, team2Score: 8 },
      { setNumber: 2, team1Score: 11, team2Score: 9 },
    ];
  });

  // 2. Cricket scoring
  const [t1Runs, setT1Runs] = useState<number>(140);
  const [t1Wickets, setT1Wickets] = useState<number>(4);
  const [t1Overs, setT1Overs] = useState<string>('10.0');

  const [t2Runs, setT2Runs] = useState<number>(135);
  const [t2Wickets, setT2Wickets] = useState<number>(7);
  const [t2Overs, setT2Overs] = useState<string>('10.0');

  // 3. Relay Race / Time scoring
  const [t1TimeMin, setT1TimeMin] = useState<number>(3);
  const [t1TimeSec, setT1TimeSec] = useState<number>(42);
  const [t2TimeMin, setT2TimeMin] = useState<number>(3);
  const [t2TimeSec, setT2TimeSec] = useState<number>(55);

  // 4. Goals (Football)
  const [t1Goals, setT1Goals] = useState<number>(2);
  const [t2Goals, setT2Goals] = useState<number>(1);

  // Common stats
  const [selectedWinner, setSelectedWinner] = useState<string>(activeScoreMatch.winner || activeScoreMatch.team1Player1);
  const [selectedMvp, setSelectedMvp] = useState<string>(activeScoreMatch.stats?.mvp || activeScoreMatch.team1Player1);
  const [notes, setNotes] = useState<string>(activeScoreMatch.stats?.notes || '');
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('completed');
  const [longestRally, setLongestRally] = useState<number>(activeScoreMatch.stats?.longestRally || 18);
  const [t1Aces, setT1Aces] = useState<number>(activeScoreMatch.stats?.acesOrWinners?.team1 || 8);
  const [t2Aces, setT2Aces] = useState<number>(activeScoreMatch.stats?.acesOrWinners?.team2 || 5);

  // Automatic winner calculation for sets
  useEffect(() => {
    if (sport.scoringType === 'sets') {
      let t1Wins = 0;
      let t2Wins = 0;
      sets.forEach((s) => {
        if (s.team1Score > s.team2Score) t1Wins++;
        else if (s.team2Score > s.team1Score) t2Wins++;
      });
      if (t1Wins > t2Wins) {
        setSelectedWinner(activeScoreMatch.team1Player1);
      } else if (t2Wins > t1Wins) {
        setSelectedWinner(activeScoreMatch.team2Player1);
      }
    } else if (sport.scoringType === 'cricket') {
      if (t1Runs > t2Runs) {
        setSelectedWinner(activeScoreMatch.team1Player1);
      } else if (t2Runs > t1Runs) {
        setSelectedWinner(activeScoreMatch.team2Player1);
      }
    } else if (sport.scoringType === 'time') {
      const t1TotalSec = t1TimeMin * 60 + t1TimeSec;
      const t2TotalSec = t2TimeMin * 60 + t2TimeSec;
      if (t1TotalSec < t2TotalSec) {
        setSelectedWinner(activeScoreMatch.team1Player1);
      } else {
        setSelectedWinner(activeScoreMatch.team2Player1);
      }
    } else if (sport.scoringType === 'goals') {
      if (t1Goals > t2Goals) {
        setSelectedWinner(activeScoreMatch.team1Player1);
      } else if (t2Goals > t1Goals) {
        setSelectedWinner(activeScoreMatch.team2Player1);
      }
    }
  }, [sets, t1Runs, t2Runs, t1TimeMin, t1TimeSec, t2TimeMin, t2TimeSec, t1Goals, t2Goals, sport.scoringType]);

  // Set management
  const handleAddSet = () => {
    setSets((prev) => [
      ...prev,
      { setNumber: prev.length + 1, team1Score: 0, team2Score: 0 },
    ]);
  };

  const handleRemoveSet = (index: number) => {
    if (sets.length <= 1) return;
    setSets((prev) => prev.filter((_, i) => i !== index).map((s, idx) => ({ ...s, setNumber: idx + 1 })));
  };

  const handleSetScoreChange = (index: number, team: 'team1' | 'team2', val: number) => {
    setSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [team === 'team1' ? 'team1Score' : 'team2Score']: Math.max(0, val) } : s))
    );
  };

  // Potential MVPs from participating athletes
  const candidatePlayers = useMemo(() => {
    const list: string[] = [];
    if (activeScoreMatch.team1Player1) list.push(activeScoreMatch.team1Player1);
    if (activeScoreMatch.team1Player2) list.push(activeScoreMatch.team1Player2);
    if (activeScoreMatch.team2Player1) list.push(activeScoreMatch.team2Player1);
    if (activeScoreMatch.team2Player2) list.push(activeScoreMatch.team2Player2);
    return list;
  }, [activeScoreMatch]);

  const handleSave = () => {
    let finalScoresString = '';
    const statsObj: MatchStats = {
      mvp: selectedMvp,
      notes,
    };

    if (sport.scoringType === 'sets') {
      finalScoresString = sets.map((s) => `Set ${s.setNumber}: ${s.team1Score}-${s.team2Score}`).join(', ');
      let t1Pts = 0;
      let t2Pts = 0;
      sets.forEach((s) => {
        t1Pts += s.team1Score;
        t2Pts += s.team2Score;
      });
      statsObj.totalPointsWon = { team1: t1Pts, team2: t2Pts };
      statsObj.longestRally = longestRally;
      statsObj.acesOrWinners = { team1: t1Aces, team2: t2Aces };
    } else if (sport.scoringType === 'cricket') {
      finalScoresString = `${t1Runs}/${t1Wickets} (${t1Overs} ov) vs ${t2Runs}/${t2Wickets} (${t2Overs} ov)`;
      statsObj.runRateOrSpeed = `${(t1Runs / 10).toFixed(1)} RPO vs ${(t2Runs / 10).toFixed(1)} RPO`;
    } else if (sport.scoringType === 'time') {
      finalScoresString = `${t1TimeMin}m ${t1TimeSec}s vs ${t2TimeMin}m ${t2TimeSec}s`;
      statsObj.runRateOrSpeed = `Split diff: ${Math.abs(t1TimeMin * 60 + t1TimeSec - (t2TimeMin * 60 + t2TimeSec))}s`;
    } else if (sport.scoringType === 'goals') {
      finalScoresString = `${t1Goals} - ${t2Goals}`;
    }

    // Fire fireworks celebration if Gold Finals match!
    if (isFinals) {
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#ffffff'],
        });
      } catch (err) {
        console.log('Confetti triggered', err);
      }
    }

    updateMatchScore(
      activeScoreMatch.id,
      finalScoresString,
      selectedWinner,
      sport.scoringType === 'sets' ? sets : undefined,
      statsObj,
      matchStatus
    );

    setActiveScoreMatch(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {isFinals ? '🏆 Championship Finals Scorekeeper' : 'Match Scorekeeper'}
              </h2>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>{sport.name}</span>
                <span>·</span>
                <span className="font-mono">{activeScoreMatch.eventCode}</span>
                <span>·</span>
                <span>{activeScoreMatch.matchName}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveScoreMatch(null)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Match Status Selector */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Match Status
            </span>
            <div className="flex items-center gap-1 bg-white dark:bg-slate-700 p-0.5 rounded-lg border border-slate-200 dark:border-slate-600 text-xs">
              <button
                type="button"
                onClick={() => setMatchStatus('live')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  matchStatus === 'live'
                    ? 'bg-rose-500 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                In Progress (Live)
              </button>
              <button
                type="button"
                onClick={() => setMatchStatus('completed')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  matchStatus === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Final Result
              </button>
            </div>
          </div>

          {/* Teams Header */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Team 1
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {activeScoreMatch.team1Player1}
              </div>
              {activeScoreMatch.team1Player2 && (
                <div className="text-[11px] text-slate-500 truncate">
                  & {activeScoreMatch.team1Player2}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Team 2
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {activeScoreMatch.team2Player1}
              </div>
              {activeScoreMatch.team2Player2 && (
                <div className="text-[11px] text-slate-500 truncate">
                  & {activeScoreMatch.team2Player2}
                </div>
              )}
            </div>
          </div>

          {/* SPORT-SPECIFIC SCORE INPUTS */}
          
          {/* A. Sets (Table Tennis / Badminton) */}
          {sport.scoringType === 'sets' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Set-by-Set Scorecard
                </span>
                <button
                  type="button"
                  onClick={handleAddSet}
                  className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Set</span>
                </button>
              </div>

              <div className="space-y-2">
                {sets.map((set, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700"
                  >
                    <span className="text-xs font-bold text-slate-500 w-12 font-mono">
                      Set {set.setNumber}
                    </span>

                    <div className="flex items-center gap-3 flex-1 justify-center">
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={set.team1Score}
                        onChange={(e) => handleSetScoreChange(idx, 'team1', parseInt(e.target.value) || 0)}
                        className="w-14 py-1.5 text-center text-base font-extrabold font-mono bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="text-slate-400 font-bold">:</span>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={set.team2Score}
                        onChange={(e) => handleSetScoreChange(idx, 'team2', parseInt(e.target.value) || 0)}
                        className="w-14 py-1.5 text-center text-base font-extrabold font-mono bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSet(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove set"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Rallies & Aces */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500">Longest Rally (Shots)</label>
                  <input
                    type="number"
                    value={longestRally}
                    onChange={(e) => setLongestRally(parseInt(e.target.value) || 0)}
                    className="w-full mt-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500">Aces/Winners (T1 vs T2)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={t1Aces}
                      onChange={(e) => setT1Aces(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="number"
                      value={t2Aces}
                      onChange={(e) => setT2Aces(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B. Cricket Scoring */}
          {sport.scoringType === 'cricket' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Innings Breakdown
              </span>

              {/* Team 1 Score */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 border border-slate-200/60 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {activeScoreMatch.team1Player1}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Runs</label>
                    <input
                      type="number"
                      value={t1Runs}
                      onChange={(e) => setT1Runs(parseInt(e.target.value) || 0)}
                      className="w-full mt-0.5 px-3 py-1.5 text-sm font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Wickets</label>
                    <input
                      type="number"
                      max="10"
                      value={t1Wickets}
                      onChange={(e) => setT1Wickets(parseInt(e.target.value) || 0)}
                      className="w-full mt-0.5 px-3 py-1.5 text-sm font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Overs</label>
                    <input
                      type="text"
                      value={t1Overs}
                      onChange={(e) => setT1Overs(e.target.value)}
                      placeholder="10.0"
                      className="w-full mt-0.5 px-3 py-1.5 text-sm font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Team 2 Score */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 border border-slate-200/60 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {activeScoreMatch.team2Player1}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Runs</label>
                    <input
                      type="number"
                      value={t2Runs}
                      onChange={(e) => setT2Runs(parseInt(e.target.value) || 0)}
                      className="w-full mt-0.5 px-3 py-1.5 text-sm font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Wickets</label>
                    <input
                      type="number"
                      max="10"
                      value={t2Wickets}
                      onChange={(e) => setT2Wickets(parseInt(e.target.value) || 0)}
                      className="w-full mt-0.5 px-3 py-1.5 text-sm font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Overs</label>
                    <input
                      type="text"
                      value={t2Overs}
                      onChange={(e) => setT2Overs(e.target.value)}
                      placeholder="10.0"
                      className="w-full mt-0.5 px-3 py-1.5 text-sm font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* C. Relay Race Timing */}
          {sport.scoringType === 'time' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Finish Times (Minutes & Seconds)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
                  <div className="text-xs font-bold truncate">{activeScoreMatch.team1Player1}</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={t1TimeMin}
                      onChange={(e) => setT1TimeMin(parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-center font-mono font-bold bg-white dark:bg-slate-700 rounded-lg"
                    />
                    <span className="text-xs text-slate-400">m</span>
                    <input
                      type="number"
                      value={t1TimeSec}
                      onChange={(e) => setT1TimeSec(parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-center font-mono font-bold bg-white dark:bg-slate-700 rounded-lg"
                    />
                    <span className="text-xs text-slate-400">s</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
                  <div className="text-xs font-bold truncate">{activeScoreMatch.team2Player1}</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={t2TimeMin}
                      onChange={(e) => setT2TimeMin(parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-center font-mono font-bold bg-white dark:bg-slate-700 rounded-lg"
                    />
                    <span className="text-xs text-slate-400">m</span>
                    <input
                      type="number"
                      value={t2TimeSec}
                      onChange={(e) => setT2TimeSec(parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-center font-mono font-bold bg-white dark:bg-slate-700 rounded-lg"
                    />
                    <span className="text-xs text-slate-400">s</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* D. Football Goals */}
          {sport.scoringType === 'goals' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Full-Time Goals
              </span>
              <div className="flex items-center justify-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <input
                  type="number"
                  min="0"
                  value={t1Goals}
                  onChange={(e) => setT1Goals(parseInt(e.target.value) || 0)}
                  className="w-16 py-2 text-center text-xl font-bold bg-white dark:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-600"
                />
                <span className="text-xl font-bold text-slate-400">-</span>
                <input
                  type="number"
                  min="0"
                  value={t2Goals}
                  onChange={(e) => setT2Goals(parseInt(e.target.value) || 0)}
                  className="w-16 py-2 text-center text-xl font-bold bg-white dark:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-600"
                />
              </div>
            </div>
          )}

          {/* Winner Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Declare Official Winner
            </label>
            <select
              value={selectedWinner}
              onChange={(e) => setSelectedWinner(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value={activeScoreMatch.team1Player1}>{activeScoreMatch.team1Player1}</option>
              <option value={activeScoreMatch.team2Player1}>{activeScoreMatch.team2Player1}</option>
              <option value="Draw / Tie">Draw / Tie</option>
            </select>
          </div>

          {/* MVP Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Player of the Match / MVP</span>
            </label>
            <select
              value={selectedMvp}
              onChange={(e) => setSelectedMvp(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              {candidatePlayers.map((player) => (
                <option key={player} value={player}>
                  {player}
                </option>
              ))}
            </select>
          </div>

          {/* Match Notes / Commentary */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Referee Notes / Highlights
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Decisive 3rd set rally or extraordinary catch at deep mid-wicket."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveScoreMatch(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-colors shadow-md"
          >
            {isFinals && <Sparkles className="w-3.5 h-3.5 text-slate-950" />}
            <span>{isFinals ? 'Finalize Gold Medal Score' : 'Save Match Score'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

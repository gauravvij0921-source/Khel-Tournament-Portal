import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { SPORTS_CATEGORIES, getSportCategory } from '../data/sportsData';
import { 
  X, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Users, 
  FileSpreadsheet, 
  ShieldCheck, 
  Award, 
  Download, 
  Upload, 
  Check, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { EventType, Match, MatchStage, UserRole, Player } from '../types';
import { exportMatchesToCSV, exportPlayersToCSV, downloadFile } from '../utils/csvHelper';

export const AdminConsoleModal: React.FC = () => {
  const {
    isAdminConsoleOpen,
    setIsAdminConsoleOpen,
    matches,
    allPlayers,
    addMatch,
    updateMatch,
    deleteMatch,
    updatePlayerRole,
    addPlayer,
    importMatchesCSV,
    resetToMockData,
  } = useTournament();

  const [activeTab, setActiveTab] = useState<'fixtures' | 'roles' | 'csv'>('fixtures');

  // Form for New / Edit Fixture
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [sportId, setSportId] = useState<string>('table-tennis');
  const [matchName, setMatchName] = useState<MatchStage>('Group');
  const [eventType, setEventType] = useState<EventType>('Singles');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('15:00');
  const [durationMin, setDurationMin] = useState<number>(40);
  const [team1Player1, setTeam1Player1] = useState<string>('');
  const [team1Player2, setTeam1Player2] = useState<string>('');
  const [team2Player1, setTeam2Player1] = useState<string>('');
  const [team2Player2, setTeam2Player2] = useState<string>('');
  const [venue, setVenue] = useState<string>('Centre Court - Table 1');

  // CSV Import State
  const [csvInput, setCsvInput] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // New Player Form State
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPhone, setNewPlayerPhone] = useState('+91');
  const [newPlayerTeam, setNewPlayerTeam] = useState('Titans Apex');
  const [newPlayerRole, setNewPlayerRole] = useState<UserRole>('player');

  if (!isAdminConsoleOpen) return null;

  const handleStartEditMatch = (m: Match) => {
    setEditingMatchId(m.id);
    setSportId(m.sportId);
    setMatchName(m.matchName);
    setEventType(m.eventType);
    setDate(m.date);
    setStartTime(m.startTime);
    setDurationMin(m.matchDurationMin);
    setTeam1Player1(m.team1Player1);
    setTeam1Player2(m.team1Player2 || '');
    setTeam2Player1(m.team2Player1);
    setTeam2Player2(m.team2Player2 || '');
    setVenue(m.venue);
  };

  const handleResetFixtureForm = () => {
    setEditingMatchId(null);
    setTeam1Player1('');
    setTeam1Player2('');
    setTeam2Player1('');
    setTeam2Player2('');
  };

  const calculateEndTime = (start: string, duration: number): string => {
    const [h, m] = start.split(':').map(Number);
    const totalMin = h * 60 + m + duration;
    const endH = Math.floor(totalMin / 60) % 24;
    const endM = totalMin % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  };

  const handleSaveFixture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!team1Player1.trim() || !team2Player1.trim()) return;

    const endTime = calculateEndTime(startTime, durationMin);

    if (editingMatchId) {
      const existing = matches.find((m) => m.id === editingMatchId);
      if (existing) {
        updateMatch({
          ...existing,
          sportId,
          matchName,
          eventType,
          date,
          startTime,
          matchDurationMin: durationMin,
          endTime,
          team1Player1,
          team1Player2: eventType === 'Doubles' ? team1Player2 : undefined,
          team2Player1,
          team2Player2: eventType === 'Doubles' ? team2Player2 : undefined,
          venue,
        });
      }
    } else {
      const sportPrefix = sportId.slice(0, 3).toUpperCase();
      const eventCode = `${sportPrefix}-${matchName.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 90 + 10)}`;

      addMatch({
        eventCode,
        sportId,
        matchName,
        date,
        startTime,
        matchDurationMin: durationMin,
        endTime,
        eventType,
        team1Player1,
        team1Player2: eventType === 'Doubles' ? team1Player2 : undefined,
        team2Player1,
        team2Player2: eventType === 'Doubles' ? team2Player2 : undefined,
        venue,
        status: 'upcoming',
      });
    }

    handleResetFixtureForm();
  };

  const handleImportCSV = () => {
    if (!csvInput.trim()) return;
    const count = importMatchesCSV(csvInput);
    setImportStatus(`Successfully processed and loaded ${count} matches!`);
    setCsvInput('');
    setTimeout(() => setImportStatus(null), 4000);
  };

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || newPlayerPhone.length < 5) return;

    addPlayer({
      name: newPlayerName.trim(),
      phoneNumber: newPlayerPhone.trim(),
      teamName: newPlayerTeam.trim(),
      role: newPlayerRole,
      assignedSports: newPlayerRole === 'scorer' ? ['table-tennis'] : undefined,
    });

    setNewPlayerName('');
    setNewPlayerPhone('+91');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Tournament Director Console
              </h2>
              <p className="text-xs text-slate-500">
                Manage championship fixtures, promote user roles, and export data
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminConsoleOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs">
          <button
            onClick={() => setActiveTab('fixtures')}
            className={`px-4 py-2.5 font-bold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === 'fixtures'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Fixture Management ({matches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2.5 font-bold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === 'roles'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Roles & RBAC ({allPlayers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`px-4 py-2.5 font-bold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === 'csv'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV Export & Import</span>
          </button>
        </div>

        {/* Console Tab Content */}
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: FIXTURES */}
          {activeTab === 'fixtures' && (
            <div className="space-y-6">
              
              {/* Fixture Creator Form */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-amber-500" />
                    <span>{editingMatchId ? 'Edit Fixture Details' : 'Schedule New Match Fixture'}</span>
                  </h3>
                  {editingMatchId && (
                    <button
                      type="button"
                      onClick={handleResetFixtureForm}
                      className="text-xs text-rose-500 hover:underline font-semibold"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveFixture} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Sport Category</label>
                      <select
                        value={sportId}
                        onChange={(e) => setSportId(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-medium"
                      >
                        {SPORTS_CATEGORIES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Stage</label>
                      <select
                        value={matchName}
                        onChange={(e) => setMatchName(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-medium"
                      >
                        <option value="Finals">Finals (Gold Medal)</option>
                        <option value="SF">Semifinals (SF)</option>
                        <option value="QF">Quarterfinals (QF)</option>
                        <option value="KO">Knockout (KO)</option>
                        <option value="Group">Group Stage</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Event Type</label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value as EventType)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-medium"
                      >
                        <option value="Singles">Singles</option>
                        <option value="Doubles">Doubles</option>
                        <option value="Team">Team</option>
                      </select>
                    </div>
                  </div>

                  {/* Date, Time, Duration, Venue */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration (Min)</label>
                      <input
                        type="number"
                        min="10"
                        step="5"
                        value={durationMin}
                        onChange={(e) => setDurationMin(parseInt(e.target.value) || 40)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Venue / Court</label>
                      <input
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="Court 1 / Oval Pitch"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-medium"
                      />
                    </div>
                  </div>

                  {/* Competitors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Team 1 */}
                    <div className="space-y-2 p-3 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                      <span className="font-bold text-slate-700 dark:text-slate-200">Team 1 Competitor(s)</span>
                      <input
                        type="text"
                        value={team1Player1}
                        onChange={(e) => setTeam1Player1(e.target.value)}
                        placeholder="Player 1 or Team Name"
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"
                        required
                      />
                      {eventType === 'Doubles' && (
                        <input
                          type="text"
                          value={team1Player2}
                          onChange={(e) => setTeam1Player2(e.target.value)}
                          placeholder="Partner Player 2"
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"
                        />
                      )}
                    </div>

                    {/* Team 2 */}
                    <div className="space-y-2 p-3 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                      <span className="font-bold text-slate-700 dark:text-slate-200">Team 2 Competitor(s)</span>
                      <input
                        type="text"
                        value={team2Player1}
                        onChange={(e) => setTeam2Player1(e.target.value)}
                        placeholder="Player 1 or Team Name"
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"
                        required
                      />
                      {eventType === 'Doubles' && (
                        <input
                          type="text"
                          value={team2Player2}
                          onChange={(e) => setTeam2Player2(e.target.value)}
                          placeholder="Partner Player 2"
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-colors shadow-xs"
                    >
                      {editingMatchId ? 'Update Fixture' : 'Create Fixture'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Fixtures Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Championship Fixtures Master List
                </h4>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                            {m.eventCode}
                          </span>
                          <span>·</span>
                          <span className="capitalize">{m.sportId}</span>
                          <span>·</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{m.matchName}</span>
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                          {m.team1Player1} vs {m.team2Player1}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {m.date} · {m.startTime} - {m.endTime} · {m.venue}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEditMatch(m)}
                          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit Fixture"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMatch(m.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Delete Fixture"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ROLES & RBAC */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              
              {/* Quick Add Player / Official */}
              <form onSubmit={handleCreatePlayer} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-3">
                <span className="font-bold text-slate-900 dark:text-white block">Register New Participant / Scorer</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-medium"
                    required
                  />
                  <input
                    type="text"
                    placeholder="+919876543210"
                    value={newPlayerPhone}
                    onChange={(e) => setNewPlayerPhone(e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-medium font-mono"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Team Name"
                    value={newPlayerTeam}
                    onChange={(e) => setNewPlayerTeam(e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors"
                  >
                    Add User
                  </button>
                </div>
              </form>

              {/* Roster & Role Permissions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Role Assignments & Assigned Sports
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Changes take effect immediately
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
                  {allPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
                          {player.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{player.name}</span>
                            {player.role === 'admin' ? (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800">
                                DIRECTOR
                              </span>
                            ) : player.role === 'scorer' ? (
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                                SCORER
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                                ATHLETE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {player.phoneNumber} · {player.teamName}
                          </div>
                        </div>
                      </div>

                      {/* Role Switcher & Sports Assignment */}
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={player.role || 'player'}
                          onChange={(e) => updatePlayerRole(player.id, e.target.value as UserRole)}
                          className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-semibold"
                        >
                          <option value="player">Player (View Only)</option>
                          <option value="scorer">Official Scorer</option>
                          <option value="admin">Tournament Director (Admin)</option>
                        </select>

                        {/* If Scorer, allow multi-sport toggle */}
                        {player.role === 'scorer' && (
                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            {SPORTS_CATEGORIES.map((cat) => {
                              const isAssigned = (player.assignedSports || []).includes(cat.id);
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    const current = player.assignedSports || [];
                                    const updated = isAssigned
                                      ? current.filter((id) => id !== cat.id)
                                      : [...current, cat.id];
                                    updatePlayerRole(player.id, 'scorer', updated);
                                  }}
                                  className={`px-2 py-0.5 text-[10px] rounded font-semibold transition-colors ${
                                    isAssigned
                                      ? 'bg-blue-600 text-white'
                                      : 'text-slate-500 hover:text-slate-900'
                                  }`}
                                  title={`Toggle scoring for ${cat.name}`}
                                >
                                  {cat.name.split(' ')[0]}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CSV IMPORT & EXPORT */}
          {activeTab === 'csv' && (
            <div className="space-y-6 text-xs">
              
              {/* Export Section */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Direct CSV Export
                </h4>
                <p className="text-slate-500">
                  Download all tournament fixtures and complete player roster in standard comma-separated format.
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => {
                      const csv = exportMatchesToCSV(matches);
                      downloadFile(csv, `khel-fixtures-${Date.now()}.csv`);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold rounded-xl shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download All Fixtures CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      const csv = exportPlayersToCSV(allPlayers);
                      downloadFile(csv, `khel-players-roster-${Date.now()}.csv`);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white font-bold rounded-xl"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Player Roster CSV</span>
                  </button>
                </div>
              </div>

              {/* Paste & Import CSV */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Paste & Import Fixtures CSV
                </h4>
                <p className="text-slate-500">
                  Paste raw CSV text containing match fixtures to bulk load or update tournament schedules.
                </p>

                <textarea
                  rows={4}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder={`EventCode,SportId,MatchStage,Date,StartTime,DurationMin,Team1Player1,Team2Player1,Venue\nTT-FIN-01,table-tennis,Finals,2026-10-24,16:00,45,Gaurav Vij,Priya Nair,Centre Court`}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <div className="flex items-center justify-between">
                  {importStatus ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> {importStatus}
                    </span>
                  ) : <span />}

                  <button
                    onClick={handleImportCSV}
                    disabled={!csvInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import Fixtures</span>
                  </button>
                </div>
              </div>

              {/* Reset to Mock Data */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Reset Portal Database</span>
                  <p className="text-slate-500 text-[11px]">Restores original championship seed schedule and personas</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Reset all match fixtures and scores back to initial state?')) {
                      resetToMockData();
                    }
                  }}
                  className="px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-semibold"
                >
                  Reset to Defaults
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <button
            onClick={() => setIsAdminConsoleOpen(false)}
            className="px-5 py-2 text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

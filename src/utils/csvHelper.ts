import { Match, Player } from '../types';

/**
 * Normalizes a Google Sheets link to a direct CSV export endpoint.
 * Handles:
 * - https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit#gid=0
 * - https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/view...
 * - https://docs.google.com/spreadsheets/d/e/{PUBLISHED_KEY}/pubhtml
 * - direct CSV URLs
 */
export function normalizeGoogleSheetUrl(rawUrl: string): string {
  if (!rawUrl || !rawUrl.trim()) return '';
  const trimmed = rawUrl.trim();

  // If it's already a csv export format
  if (trimmed.includes('format=csv') || trimmed.endsWith('.csv')) {
    return trimmed;
  }

  // Published web link: /d/e/{KEY}/pubhtml or /d/e/{KEY}/pub
  const publishedMatch = trimmed.match(/\/d\/e\/([a-zA-Z0-9_-]+)/);
  if (publishedMatch && publishedMatch[1]) {
    return `https://docs.google.com/spreadsheets/d/e/${publishedMatch[1]}/pub?output=csv`;
  }

  // Standard Google Sheet URL: /spreadsheets/d/{ID}/...
  const sheetIdMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetIdMatch && sheetIdMatch[1]) {
    const id = sheetIdMatch[1];
    // Check if there's a gid parameter for a specific sheet tab
    const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv${gidParam}`;
  }

  return trimmed;
}

/**
 * Parses raw CSV string into a 2D array of string cells, taking quotes into account.
 */
export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let currentCell = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      row.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentCell.trim());
      if (row.length > 0 && row.some((cell) => cell !== '')) {
        lines.push(row);
      }
      row = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || row.length > 0) {
    row.push(currentCell.trim());
    if (row.some((cell) => cell !== '')) {
      lines.push(row);
    }
  }

  return lines;
}

/**
 * Converts Match objects into CSV string.
 */
export function exportMatchesToCSV(matches: Match[]): string {
  const headers = [
    'ID',
    'EventCode',
    'SportId',
    'MatchStage',
    'Date',
    'StartTime',
    'DurationMin',
    'EndTime',
    'EventType',
    'Team1Player1',
    'Team1Player2',
    'Team2Player1',
    'Team2Player2',
    'Venue',
    'Status',
    'Winner',
    'Scores',
    'MVP',
    'Notes',
  ];

  const escapeCell = (val?: string | number | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = matches.map((m) => [
    escapeCell(m.id),
    escapeCell(m.eventCode),
    escapeCell(m.sportId),
    escapeCell(m.matchName),
    escapeCell(m.date),
    escapeCell(m.startTime),
    escapeCell(m.matchDurationMin),
    escapeCell(m.endTime),
    escapeCell(m.eventType),
    escapeCell(m.team1Player1),
    escapeCell(m.team1Player2 || ''),
    escapeCell(m.team2Player1),
    escapeCell(m.team2Player2 || ''),
    escapeCell(m.venue),
    escapeCell(m.status),
    escapeCell(m.winner || ''),
    escapeCell(m.scores || ''),
    escapeCell(m.stats?.mvp || ''),
    escapeCell(m.stats?.notes || ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Converts Player objects into CSV string.
 */
export function exportPlayersToCSV(players: Player[]): string {
  const headers = [
    'ID',
    'Name',
    'PhoneNumber',
    'TeamName',
    'Department',
    'JerseyNumber',
    'PrimarySport',
    'Role',
    'AssignedSports',
  ];

  const escapeCell = (val?: string | number | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = players.map((p) => [
    escapeCell(p.id),
    escapeCell(p.name),
    escapeCell(p.phoneNumber),
    escapeCell(p.teamName),
    escapeCell(p.department || ''),
    escapeCell(p.jerseyNumber || ''),
    escapeCell(p.primarySport || ''),
    escapeCell(p.role || 'player'),
    escapeCell((p.assignedSports || []).join(';')),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Parses CSV rows into Match items, updating existing or creating new ones.
 */
export function parseMatchesFromCSV(csvText: string): Match[] {
  const grid = parseCSV(csvText);
  if (grid.length < 2) return [];

  const headers = grid[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const getIndex = (possibleNames: string[]) => {
    for (const name of possibleNames) {
      const idx = headers.indexOf(name.toLowerCase());
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idIdx = getIndex(['id']);
  const codeIdx = getIndex(['eventcode', 'code', 'matchid']);
  const sportIdx = getIndex(['sportid', 'sport', 'category']);
  const stageIdx = getIndex(['matchstage', 'stage', 'round']);
  const dateIdx = getIndex(['date', 'matchdate']);
  const timeIdx = getIndex(['starttime', 'time']);
  const durIdx = getIndex(['durationmin', 'duration']);
  const endIdx = getIndex(['endtime']);
  const typeIdx = getIndex(['eventtype', 'type']);
  const t1p1Idx = getIndex(['team1player1', 'team1', 'player1']);
  const t1p2Idx = getIndex(['team1player2', 'team1doubles', 'player2']);
  const t2p1Idx = getIndex(['team2player1', 'team2', 'player3']);
  const t2p2Idx = getIndex(['team2player2', 'team2doubles', 'player4']);
  const venueIdx = getIndex(['venue', 'court', 'location']);
  const statusIdx = getIndex(['status', 'state']);
  const winnerIdx = getIndex(['winner']);
  const scoresIdx = getIndex(['scores', 'score', 'result']);
  const mvpIdx = getIndex(['mvp', 'potm']);
  const notesIdx = getIndex(['notes', 'remark', 'comments']);

  const matches: Match[] = [];

  for (let i = 1; i < grid.length; i++) {
    const row = grid[i];
    if (row.length < 3) continue;

    const id = (idIdx !== -1 && row[idIdx]) || `m-csv-${Date.now()}-${i}`;
    const eventCode = (codeIdx !== -1 && row[codeIdx]) || `EVT-${i.toString().padStart(2, '0')}`;
    const sportId = (sportIdx !== -1 && row[sportIdx]?.toLowerCase().replace(/\s+/g, '-')) || 'table-tennis';
    const matchName = (stageIdx !== -1 && row[stageIdx]) || 'Group';
    const date = (dateIdx !== -1 && row[dateIdx]) || new Date().toISOString().split('T')[0];
    const startTime = (timeIdx !== -1 && row[timeIdx]) || '14:00';
    const matchDurationMin = Number((durIdx !== -1 && row[durIdx]) || 40);
    const endTime = (endIdx !== -1 && row[endIdx]) || '14:40';
    const eventType = ((typeIdx !== -1 && row[typeIdx]) as any) || 'Singles';
    const team1Player1 = (t1p1Idx !== -1 && row[t1p1Idx]) || 'Team 1';
    const team1Player2 = t1p2Idx !== -1 && row[t1p2Idx] ? row[t1p2Idx] : undefined;
    const team2Player1 = (t2p1Idx !== -1 && row[t2p1Idx]) || 'Team 2';
    const team2Player2 = t2p2Idx !== -1 && row[t2p2Idx] ? row[t2p2Idx] : undefined;
    const venue = (venueIdx !== -1 && row[venueIdx]) || 'Main Court';
    const rawStatus = ((statusIdx !== -1 && row[statusIdx]?.toLowerCase()) as any) || 'upcoming';
    const status = rawStatus === 'completed' || rawStatus === 'live' ? rawStatus : 'upcoming';
    const winner = winnerIdx !== -1 && row[winnerIdx] ? row[winnerIdx] : undefined;
    const scores = scoresIdx !== -1 && row[scoresIdx] ? row[scoresIdx] : undefined;
    const mvp = mvpIdx !== -1 && row[mvpIdx] ? row[mvpIdx] : undefined;
    const notes = notesIdx !== -1 && row[notesIdx] ? row[notesIdx] : undefined;

    matches.push({
      id,
      eventCode,
      sportId,
      matchName,
      date,
      startTime,
      matchDurationMin,
      endTime,
      eventType,
      team1Player1,
      team1Player2,
      team2Player1,
      team2Player2,
      venue,
      status,
      winner,
      scores,
      stats: {
        mvp,
        notes,
      },
    });
  }

  return matches;
}

/**
 * Triggers a file download in browser.
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

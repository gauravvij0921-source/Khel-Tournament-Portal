export type EventType = 'Singles' | 'Doubles' | 'Team';
export type MatchStage = 'Group' | 'KO' | 'QF' | 'SF' | 'Finals' | string;
export type MatchStatus = 'upcoming' | 'live' | 'completed';
export type UserRole = 'admin' | 'scorer' | 'player';

export interface SetScore {
  setNumber: number;
  team1Score: number;
  team2Score: number;
}

export interface MatchStats {
  acesOrWinners?: { team1: number; team2: number };
  totalPointsWon?: { team1: number; team2: number };
  longestRally?: number;
  runRateOrSpeed?: string;
  mvp?: string;
  notes?: string;
}

export interface Match {
  id: string;
  eventCode: string;
  sportId: string;
  matchName: MatchStage;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  matchDurationMin: number;
  endTime: string; // HH:mm
  eventType: EventType;
  team1Player1: string;
  team1Player2?: string;
  team2Player1: string;
  team2Player2?: string;
  venue: string;
  winner?: string; // Team 1 or Team 2 or player name
  status: MatchStatus;
  scores?: string;
  setScores?: SetScore[];
  stats?: MatchStats;
}

export interface Player {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  teamName: string;
  department?: string;
  jerseyNumber?: number;
  primarySport?: string;
  role?: UserRole;
  assignedSports?: string[];
}

export interface SportCategory {
  id: string;
  name: string;
  icon: string;
  themeColor: {
    bgLight: string;
    textLight: string;
    borderLight: string;
    badgeBg: string;
    badgeText: string;
    accent: string;
    darkAccent: string;
  };
  scoringType: 'sets' | 'cricket' | 'time' | 'goals';
  allowedEventTypes: EventType[];
}

export interface GoogleSheetsSyncConfig {
  sheetUrl: string;
  autoSyncEnabled: boolean;
  syncIntervalSeconds: number;
  lastSynced: string | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncMessage: string;
}

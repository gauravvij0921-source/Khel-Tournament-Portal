import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Match, Player, SetScore, MatchStats, MatchStatus, UserRole, GoogleSheetsSyncConfig } from '../types';
import { INITIAL_PLAYERS, INITIAL_MATCHES } from '../data/mockData';
import { normalizeGoogleSheetUrl, parseMatchesFromCSV } from '../utils/csvHelper';
import { 
  subscribeToMatches, 
  subscribeToPlayers, 
  saveMatchToFirebase, 
  deleteMatchFromFirebase, 
  savePlayerToFirebase, 
  syncGoogleSheetToFirebase, 
  seedInitialDataToFirebaseIfEmpty,
  refreshDatabaseWithAdmins
} from '../firebase/tournamentSync';

interface TournamentContextType {
  currentUser: Player | null;
  allPlayers: Player[];
  matches: Match[];
  theme: 'light' | 'dark';
  activeTab: 'upcoming' | 'past' | 'schedule' | 'stats';
  selectedSportFilter: string;
  googleSheetsConfig: GoogleSheetsSyncConfig;
  
  // Modals state
  activeScoreMatch: Match | null;
  activeDetailMatch: Match | null;
  isAdminConsoleOpen: boolean;
  isSheetsSyncOpen: boolean;
  isLoginModalOpen: boolean;
  isShareModalOpen: boolean;
  
  // Modal setters
  setActiveScoreMatch: (match: Match | null) => void;
  setActiveDetailMatch: (match: Match | null) => void;
  setIsAdminConsoleOpen: (open: boolean) => void;
  setIsSheetsSyncOpen: (open: boolean) => void;
  setIsLoginModalOpen: (open: boolean) => void;
  setIsShareModalOpen: (open: boolean) => void;
  setActiveTab: (tab: 'upcoming' | 'past' | 'schedule' | 'stats') => void;
  setSelectedSportFilter: (sportId: string) => void;

  // Actions
  toggleTheme: () => void;
  loginWithPhone: (phone: string) => { success: boolean; message: string; player?: Player };
  switchPersona: (playerId: string) => void;
  logout: () => void;
  canUserScore: (match: Match) => boolean;
  updateMatchScore: (
    matchId: string,
    scores: string,
    winner: string,
    setScores?: SetScore[],
    stats?: MatchStats,
    status?: MatchStatus
  ) => void;
  addMatch: (matchData: Omit<Match, 'id'>) => void;
  updateMatch: (match: Match) => void;
  deleteMatch: (matchId: string) => void;
  updatePlayerRole: (playerId: string, role: UserRole, assignedSports?: string[]) => void;
  addPlayer: (playerData: Omit<Player, 'id'>) => void;
  setGoogleSheetsConfig: (config: Partial<GoogleSheetsSyncConfig>) => void;
  syncFromGoogleSheets: (customUrl?: string) => Promise<{ success: boolean; count?: number; message: string }>;
  importMatchesCSV: (csvText: string) => number;
  resetToMockData: () => void;
}

const STORAGE_KEYS = {
  PLAYERS: 'khel_players_v1',
  MATCHES: 'khel_matches_v1',
  USER_ID: 'khel_current_user_id_v2',
  THEME: 'khel_theme_v1',
  SHEETS_CONFIG: 'khel_sheets_config_v1',
};

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Apply dark mode class to HTML document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Players state
  const [allPlayers, setAllPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved players', e);
      }
    }
    return INITIAL_PLAYERS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(allPlayers));
  }, [allPlayers]);

  // Current logged in user (strictly null by default - NO auto-login, users must sign in via OTP)
  const [currentUser, setCurrentUser] = useState<Player | null>(() => {
    // Purge any stale legacy session that defaulted to Gaurav
    try {
      localStorage.removeItem('khel_current_user_id_v1');
    } catch (e) {}

    const savedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (savedUserId) {
      const found = allPlayers.find((p) => p.id === savedUserId);
      if (found) return found;
    }
    // Default to Guest (null). No user is auto-selected!
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER_ID, currentUser.id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
    }
  }, [currentUser]);

  // Matches state
  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MATCHES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved matches', e);
      }
    }
    return INITIAL_MATCHES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  }, [matches]);

  // Real-time synchronization with Firebase Firestore
  useEffect(() => {
    // 1. Seed initial data to Firestore if database is brand new
    seedInitialDataToFirebaseIfEmpty(INITIAL_MATCHES, INITIAL_PLAYERS).catch(() => {});

    // 2. Real-time matches listener across all devices
    const unsubMatches = subscribeToMatches((cloudMatches) => {
      if (cloudMatches && cloudMatches.length > 0) {
        setMatches(cloudMatches);
      }
    });

    // 3. Real-time players roster listener across all devices
    const unsubPlayers = subscribeToPlayers((cloudPlayers) => {
      if (cloudPlayers && cloudPlayers.length > 0) {
        setAllPlayers(cloudPlayers);
      }
    });

    return () => {
      unsubMatches();
      unsubPlayers();
    };
  }, []);

  // Google Sheets Config
  const [googleSheetsConfig, setSheetsConfig] = useState<GoogleSheetsSyncConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHEETS_CONFIG);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved sheets config', e);
      }
    }
    return {
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0',
      autoSyncEnabled: false,
      syncIntervalSeconds: 60,
      lastSynced: null,
      syncStatus: 'idle',
      syncMessage: 'Ready to sync with Google Sheets',
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHEETS_CONFIG, JSON.stringify(googleSheetsConfig));
  }, [googleSheetsConfig]);

  // Active UI Navigation & Filters (initialized from URL if present)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'schedule' | 'stats'>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'upcoming' || tabParam === 'past' || tabParam === 'schedule' || tabParam === 'stats') {
      return tabParam;
    }
    return 'upcoming';
  });
  const [selectedSportFilter, setSelectedSportFilter] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sport') || 'all';
  });

  // Modal Dialogs
  const [activeScoreMatch, setActiveScoreMatch] = useState<Match | null>(null);
  const [activeDetailMatch, setActiveDetailMatch] = useState<Match | null>(null);
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState<boolean>(false);
  const [isSheetsSyncOpen, setIsSheetsSyncOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('signin') === 'true' || params.get('auth') === 'login' || params.get('login') === 'true';
  });
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Sync URL search params with current tab & active user for cookie-free sharing
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      if (selectedSportFilter !== 'all') {
        url.searchParams.set('sport', selectedSportFilter);
      } else {
        url.searchParams.delete('sport');
      }
      // Always strip out any phone query parameter so phone numbers are NEVER in the URL
      url.searchParams.delete('phone');
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      // Ignore if iframe history restrictions
    }
  }, [activeTab, selectedSportFilter]);

  // Initial check for deep-linked match ID in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const matchParam = params.get('match');
    if (matchParam) {
      const targetMatch = matches.find((m) => m.id === matchParam || m.eventCode.toLowerCase() === matchParam.toLowerCase());
      if (targetMatch) {
        setActiveDetailMatch(targetMatch);
      }
    }
  }, []);

  // Authentication: Normalize mobile number and match
  const loginWithPhone = (inputPhone: string): { success: boolean; message: string; player?: Player } => {
    const cleanDigits = inputPhone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }

    const last10 = cleanDigits.slice(-10);
    const matchedPlayer = allPlayers.find((p) => {
      const pClean = p.phoneNumber.replace(/\D/g, '');
      return pClean.slice(-10) === last10;
    });

    if (matchedPlayer) {
      setCurrentUser(matchedPlayer);
      return {
        success: true,
        message: `Welcome back, ${matchedPlayer.name}! (${matchedPlayer.role?.toUpperCase() || 'PLAYER'})`,
        player: matchedPlayer,
      };
    } else {
      // Auto-create as new Athlete
      const newPlayer: Player = {
        id: `p-${Date.now()}`,
        name: `Athlete ${last10.slice(-4)}`,
        phoneNumber: `+91${last10}`,
        teamName: 'New Challengers',
        role: 'player',
        jerseyNumber: Math.floor(Math.random() * 99) + 1,
        primarySport: 'Table Tennis',
      };
      setAllPlayers((prev) => [...prev, newPlayer]);
      setCurrentUser(newPlayer);
      return {
        success: true,
        message: `Welcome to Khel Championship! You are registered as Athlete ${last10.slice(-4)}.`,
        player: newPlayer,
      };
    }
  };

  const switchPersona = (playerId: string) => {
    const found = allPlayers.find((p) => p.id === playerId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('phone');
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  };

  // Role Permissions Checking
  const canUserScore = useCallback(
    (match: Match): boolean => {
      if (!currentUser) return false;
      if (currentUser.role === 'admin') return true;
      if (currentUser.role === 'scorer') {
        const assigned = currentUser.assignedSports || [];
        return assigned.includes(match.sportId);
      }
      return false;
    },
    [currentUser]
  );

  // Score keeping
  const updateMatchScore = (
    matchId: string,
    scores: string,
    winner: string,
    setScores?: SetScore[],
    stats?: MatchStats,
    status: MatchStatus = 'completed'
  ) => {
    let updatedTarget: Match | null = null;
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        updatedTarget = {
          ...m,
          scores,
          winner,
          setScores: setScores || m.setScores,
          stats: {
            ...m.stats,
            ...stats,
          },
          status,
        };
        return updatedTarget;
      })
    );

    // Push live score update to Firebase Firestore
    if (updatedTarget) {
      saveMatchToFirebase(updatedTarget).catch((err) =>
        console.warn('Firebase match save deferred:', err)
      );
    }
  };

  // Add new match fixture
  const addMatch = (matchData: Omit<Match, 'id'>) => {
    const newMatch: Match = {
      ...matchData,
      id: `m-${Date.now()}`,
    };
    setMatches((prev) => [newMatch, ...prev]);
    saveMatchToFirebase(newMatch).catch((err) =>
      console.warn('Firebase add match deferred:', err)
    );
  };

  // Update existing match
  const updateMatch = (updated: Match) => {
    setMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    saveMatchToFirebase(updated).catch((err) =>
      console.warn('Firebase update match deferred:', err)
    );
  };

  // Delete match fixture
  const deleteMatch = (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    deleteMatchFromFirebase(matchId).catch((err) =>
      console.warn('Firebase delete match deferred:', err)
    );
  };

  // Update player role & assigned sports
  const updatePlayerRole = (playerId: string, role: UserRole, assignedSports?: string[]) => {
    let updatedPlayer: Player | null = null;
    setAllPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== playerId) return p;
        updatedPlayer = {
          ...p,
          role,
          assignedSports: assignedSports !== undefined ? assignedSports : p.assignedSports,
        };
        return updatedPlayer;
      })
    );

    if (updatedPlayer) {
      savePlayerToFirebase(updatedPlayer).catch((err) =>
        console.warn('Firebase update player deferred:', err)
      );
    }

    // If updating current user
    if (currentUser && currentUser.id === playerId) {
      setCurrentUser((prev) => (prev ? { ...prev, role, assignedSports } : null));
    }
  };

  // Add new player
  const addPlayer = (playerData: Omit<Player, 'id'>) => {
    const newPlayer: Player = {
      ...playerData,
      id: `p-${Date.now()}`,
    };
    setAllPlayers((prev) => [...prev, newPlayer]);
    savePlayerToFirebase(newPlayer).catch((err) =>
      console.warn('Firebase add player deferred:', err)
    );
  };

  // Update Google Sheets config
  const setGoogleSheetsConfig = (partial: Partial<GoogleSheetsSyncConfig>) => {
    setSheetsConfig((prev) => ({ ...prev, ...partial }));
  };

  // Sync from Google Sheets -> Batch updates Firebase Firestore!
  const syncFromGoogleSheets = async (customUrl?: string): Promise<{ success: boolean; count?: number; message: string }> => {
    const targetUrl = customUrl || googleSheetsConfig.sheetUrl;
    if (!targetUrl) {
      return { success: false, message: 'Please provide a valid Google Sheet URL.' };
    }

    const csvUrl = normalizeGoogleSheetUrl(targetUrl);

    setSheetsConfig((prev) => ({
      ...prev,
      syncStatus: 'syncing',
      syncMessage: 'Connecting to Google Sheets...',
    }));

    try {
      // Fetch via direct CSV link
      const response = await fetch(csvUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Google Sheets responded with HTTP status ${response.status}`);
      }

      const csvText = await response.text();
      const parsedMatches = parseMatchesFromCSV(csvText);

      if (parsedMatches.length === 0) {
        throw new Error('No matching fixture rows were found in the sheet. Please ensure headers match the template.');
      }

      // Replace matches locally (Full Overwrite / Replacement)
      setMatches(parsedMatches);

      // Core Request: Overwrite / Replace Google Sheet schedule directly into Firebase Firestore!
      try {
        await syncGoogleSheetToFirebase(parsedMatches);
      } catch (fbErr) {
        console.warn('Firebase Firestore batch update notice:', fbErr);
      }

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setSheetsConfig((prev) => ({
        ...prev,
        lastSynced: now,
        syncStatus: 'success',
        syncMessage: `Replaced tournament database with ${parsedMatches.length} matches from Google Sheets in Firebase at ${now}.`,
      }));

      return {
        success: true,
        count: parsedMatches.length,
        message: `Successfully replaced tournament database with ${parsedMatches.length} fixtures from Google Sheets in Firebase! All connected user devices updated live.`,
      };
    } catch (err: any) {
      console.warn('Google Sheets live sync error:', err.message);
      // Helpful error message if CORS / access restricted
      let errorMsg = err.message || 'Failed to fetch Google Sheet.';
      if (err.message && err.message.includes('Failed to fetch')) {
        errorMsg =
          'Could not reach Google Sheets. Make sure the sheet is shared as "Anyone with the link can view", or published to Web (File > Share > Publish to web as CSV).';
      }

      setSheetsConfig((prev) => ({
        ...prev,
        syncStatus: 'error',
        syncMessage: errorMsg,
      }));

      return { success: false, message: errorMsg };
    }
  };

  // Auto-sync interval polling
  useEffect(() => {
    if (!googleSheetsConfig.autoSyncEnabled || !googleSheetsConfig.sheetUrl) return;

    const intervalMs = (googleSheetsConfig.syncIntervalSeconds || 60) * 1000;
    const timer = setInterval(() => {
      syncFromGoogleSheets();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [googleSheetsConfig.autoSyncEnabled, googleSheetsConfig.syncIntervalSeconds, googleSheetsConfig.sheetUrl]);

  // Import from custom CSV text (Full replacement)
  const importMatchesCSV = (csvText: string): number => {
    const parsed = parseMatchesFromCSV(csvText);
    if (parsed.length > 0) {
      setMatches(parsed);
      syncGoogleSheetToFirebase(parsed).catch((err) =>
        console.warn('Firebase batch replace notice:', err)
      );
    }
    return parsed.length;
  };

  const resetToMockData = () => {
    setAllPlayers(INITIAL_PLAYERS);
    setMatches(INITIAL_MATCHES);
    setCurrentUser(INITIAL_PLAYERS[0]); // Gaurav Vij (7028296694, Admin)
    localStorage.removeItem(STORAGE_KEYS.PLAYERS);
    localStorage.removeItem(STORAGE_KEYS.MATCHES);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    refreshDatabaseWithAdmins(INITIAL_PLAYERS).catch(() => {});
  };

  return (
    <TournamentContext.Provider
      value={{
        currentUser,
        allPlayers,
        matches,
        theme,
        activeTab,
        selectedSportFilter,
        googleSheetsConfig,
        activeScoreMatch,
        activeDetailMatch,
        isAdminConsoleOpen,
        isSheetsSyncOpen,
        isLoginModalOpen,
        isShareModalOpen,
        setActiveScoreMatch,
        setActiveDetailMatch,
        setIsAdminConsoleOpen,
        setIsSheetsSyncOpen,
        setIsLoginModalOpen,
        setIsShareModalOpen,
        setActiveTab,
        setSelectedSportFilter,
        toggleTheme,
        loginWithPhone,
        switchPersona,
        logout,
        canUserScore,
        updateMatchScore,
        addMatch,
        updateMatch,
        deleteMatch,
        updatePlayerRole,
        addPlayer,
        setGoogleSheetsConfig,
        syncFromGoogleSheets,
        importMatchesCSV,
        resetToMockData,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};

import { SportCategory } from '../types';

export const SPORTS_CATEGORIES: SportCategory[] = [
  {
    id: 'table-tennis',
    name: 'Table Tennis',
    icon: 'Activity',
    scoringType: 'sets',
    allowedEventTypes: ['Singles', 'Doubles'],
    themeColor: {
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
      textLight: 'text-emerald-700 dark:text-emerald-400',
      borderLight: 'border-emerald-200 dark:border-emerald-800/60',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50',
      badgeText: 'text-emerald-800 dark:text-emerald-300',
      accent: 'emerald-600',
      darkAccent: 'emerald-400',
    },
  },
  {
    id: 'cricket',
    name: 'Cricket',
    icon: 'Shield',
    scoringType: 'cricket',
    allowedEventTypes: ['Team'],
    themeColor: {
      bgLight: 'bg-amber-50 dark:bg-amber-950/40',
      textLight: 'text-amber-700 dark:text-amber-400',
      borderLight: 'border-amber-200 dark:border-amber-800/60',
      badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
      badgeText: 'text-amber-800 dark:text-amber-300',
      accent: 'amber-600',
      darkAccent: 'amber-400',
    },
  },
  {
    id: 'relay',
    name: 'Relay Race',
    icon: 'Zap',
    scoringType: 'time',
    allowedEventTypes: ['Team'],
    themeColor: {
      bgLight: 'bg-rose-50 dark:bg-rose-950/40',
      textLight: 'text-rose-700 dark:text-rose-400',
      borderLight: 'border-rose-200 dark:border-rose-800/60',
      badgeBg: 'bg-rose-100 dark:bg-rose-900/50',
      badgeText: 'text-rose-800 dark:text-rose-300',
      accent: 'rose-600',
      darkAccent: 'rose-400',
    },
  },
  {
    id: 'badminton',
    name: 'Badminton',
    icon: 'Target',
    scoringType: 'sets',
    allowedEventTypes: ['Singles', 'Doubles'],
    themeColor: {
      bgLight: 'bg-sky-50 dark:bg-sky-950/40',
      textLight: 'text-sky-700 dark:text-sky-400',
      borderLight: 'border-sky-200 dark:border-sky-800/60',
      badgeBg: 'bg-sky-100 dark:bg-sky-900/50',
      badgeText: 'text-sky-800 dark:text-sky-300',
      accent: 'sky-600',
      darkAccent: 'sky-400',
    },
  },
  {
    id: 'football',
    name: 'Football',
    icon: 'Flame',
    scoringType: 'goals',
    allowedEventTypes: ['Team'],
    themeColor: {
      bgLight: 'bg-indigo-50 dark:bg-indigo-950/40',
      textLight: 'text-indigo-700 dark:text-indigo-400',
      borderLight: 'border-indigo-200 dark:border-indigo-800/60',
      badgeBg: 'bg-indigo-100 dark:bg-indigo-900/50',
      badgeText: 'text-indigo-800 dark:text-indigo-300',
      accent: 'indigo-600',
      darkAccent: 'indigo-400',
    },
  },
];

export const getSportCategory = (sportId: string): SportCategory => {
  const normalized = sportId.toLowerCase().replace(/\s+/g, '-');
  const found = SPORTS_CATEGORIES.find((s) => s.id === normalized || s.name.toLowerCase() === sportId.toLowerCase());
  return (
    found || {
      id: sportId,
      name: sportId,
      icon: 'Trophy',
      scoringType: 'sets',
      allowedEventTypes: ['Singles', 'Doubles', 'Team'],
      themeColor: {
        bgLight: 'bg-slate-50 dark:bg-slate-900',
        textLight: 'text-slate-700 dark:text-slate-300',
        borderLight: 'border-slate-200 dark:border-slate-800',
        badgeBg: 'bg-slate-100 dark:bg-slate-800',
        badgeText: 'text-slate-800 dark:text-slate-200',
        accent: 'slate-600',
        darkAccent: 'slate-400',
      },
    }
  );
};

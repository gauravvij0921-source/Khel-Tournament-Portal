import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { normalizeGoogleSheetUrl, exportMatchesToCSV } from '../utils/csvHelper';
import { 
  X, 
  FileSpreadsheet, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Clock,
  Sparkles
} from 'lucide-react';

export const GoogleSheetsSyncModal: React.FC = () => {
  const {
    isSheetsSyncOpen,
    setIsSheetsSyncOpen,
    googleSheetsConfig,
    setGoogleSheetsConfig,
    syncFromGoogleSheets,
    matches,
  } = useTournament();

  const [inputUrl, setInputUrl] = useState(googleSheetsConfig.sheetUrl);
  const [isSyncing, setIsSyncing] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  if (!isSheetsSyncOpen) return null;

  const normalizedUrl = normalizeGoogleSheetUrl(inputUrl);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setResultMsg(null);

    // Save URL to config
    setGoogleSheetsConfig({ sheetUrl: inputUrl });

    const result = await syncFromGoogleSheets(inputUrl);
    setIsSyncing(false);

    if (result.success) {
      setResultMsg({ type: 'success', text: result.message });
    } else {
      setResultMsg({ type: 'error', text: result.message });
    }
  };

  const handleCopyTemplateCSV = () => {
    const sample = exportMatchesToCSV(matches.slice(0, 3));
    navigator.clipboard.writeText(sample);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Google Sheets Live Sync
              </h2>
              <p className="text-xs text-slate-500">
                Bidirectional fixture streaming and instant score updates
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSheetsSyncOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Status Alert if any */}
          {resultMsg && (
            <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
              resultMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
            }`}>
              {resultMsg.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="font-medium">{resultMsg.text}</div>
            </div>
          )}

          {/* URL Input with Normalizer Preview */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Google Sheet Public URL or Published CSV Link
            </label>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
            />

            {/* Normalized Link Indicator */}
            {normalizedUrl && (
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-[11px] space-y-1">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                  Automatic Normalized CSV Endpoint:
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 break-all select-all">
                  {normalizedUrl}
                </span>
              </div>
            )}
          </div>

          {/* Sync Trigger Button */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {googleSheetsConfig.lastSynced
                  ? `Last synced at ${googleSheetsConfig.lastSynced}`
                  : 'Never synced'}
              </span>
            </div>

            <button
              onClick={handleSyncNow}
              disabled={isSyncing || !inputUrl.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Sync Now'}</span>
            </button>
          </div>

          {/* Auto-Sync Polling Interval */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Background Auto-Sync Polling
                </span>
                <p className="text-slate-500 text-[11px]">
                  Automatically checks for score and fixture updates while tournament is live
                </p>
              </div>

              <input
                type="checkbox"
                checked={googleSheetsConfig.autoSyncEnabled}
                onChange={(e) => setGoogleSheetsConfig({ autoSyncEnabled: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {googleSheetsConfig.autoSyncEnabled && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  Polling Frequency
                </span>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-700 p-0.5 rounded-lg border border-slate-200 dark:border-slate-600 font-mono">
                  {[30, 60, 120].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setGoogleSheetsConfig({ syncIntervalSeconds: sec })}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        googleSheetsConfig.syncIntervalSeconds === sec
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Google Sheets Setup Instructions & Template */}
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 space-y-2 text-slate-700 dark:text-slate-300">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>How to setup Google Sheets for zero-barrier sync:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <li>In your Google Sheet, click <strong>File &gt; Share &gt; Publish to web</strong>.</li>
              <li>Select <strong>Entire Document</strong> or your fixtures sheet tab, choose <strong>Comma-separated values (.csv)</strong>, and click <strong>Publish</strong>.</li>
              <li>Alternatively, set Link Sharing to <strong>Anyone with the link can view</strong> and paste your standard link above.</li>
            </ol>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleCopyTemplateCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedTemplate ? 'Copied CSV Template to Clipboard!' : 'Copy Sample CSV Headers Template'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <button
            onClick={() => setIsSheetsSyncOpen(false)}
            className="px-5 py-2 text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

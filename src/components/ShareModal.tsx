import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Globe, 
  Smartphone, 
  ShieldCheck, 
  ExternalLink,
  Award,
  Calendar,
  Sparkles
} from 'lucide-react';

export const ShareModal: React.FC = () => {
  const { isShareModalOpen, setIsShareModalOpen, currentUser } = useTournament();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isShareModalOpen) return null;

  // The published preview / shared domain for this applet
  const publishedBaseUrl = 'https://ais-pre-yvvxjrjtir3mqv5bmdlg2z-678715323190.asia-southeast1.run.app';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : publishedBaseUrl;
  const baseUrl = publishedBaseUrl;

  const links = [
    {
      key: 'signin',
      title: 'Mobile Number Sign-In & Athlete Portal Link',
      desc: 'Opens directly to the mobile phone sign-in modal for users, athletes, and officials to sign in with their 10-digit number.',
      url: `${baseUrl}?signin=true`,
      icon: Smartphone,
    },
    {
      key: 'public',
      title: 'Public Championship Portal (Spectators & Fans)',
      desc: 'Clean overview of live matches, schedule, and medal standings without login required.',
      url: `${baseUrl}?tab=upcoming`,
      icon: Globe,
    },


    {
      key: 'schedule',
      title: 'Championship Master Schedule',
      desc: 'Direct link to chronological court timelines and venue fixtures.',
      url: `${baseUrl}?tab=schedule`,
      icon: Calendar,
    },
  ];

  const handleCopy = (key: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
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
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Publish & Share Portal
              </h2>
              <p className="text-xs text-slate-500">
                100% Cookie-Free architecture · Works on all mobile devices & browsers
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsShareModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Publishing Guide Banner */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>How to publish to real users in Google AI Studio:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              <li>Click the <strong>Publish</strong> or <strong>Share</strong> button at the top-right of your Google AI Studio Build header.</li>
              <li>Your application is deployed to your dedicated Cloud Run production endpoint: <br />
                <code className="bg-amber-100/70 dark:bg-amber-900/40 px-1.5 py-0.5 rounded text-[10px] text-amber-900 dark:text-amber-300 font-mono break-all select-all">
                  {publishedBaseUrl}
                </code>
              </li>
              <li>Share the link via WhatsApp, Slack, Email, or QR Code. Any user on Android, iPhone, Mac, or PC can immediately access it!</li>
            </ol>
          </div>

          {/* Cookie-Free Architecture Guarantee */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Why this portal is 100% Cookie-Free:</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Modern mobile browsers (Safari on iOS 14+, Chrome incognito, and corporate enterprise firewalls) frequently block 3rd-party and session cookies. <strong>Khel uses zero cookies.</strong> All state, role permissions, and active athlete identity are maintained client-side via <strong>LocalStorage and direct URL Query Tokens</strong> (`?phone=...&tab=...`).
            </p>
          </div>

          {/* Direct Shareable Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Ready-to-Share Direct Links
            </h4>

            <div className="space-y-2.5">
              {links.map((item) => {
                const IconComponent = item.icon;
                const isCopied = copiedKey === item.key;

                return (
                  <div
                    key={item.key}
                    className="p-3.5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <IconComponent className="w-3.5 h-3.5 text-amber-500" />
                        <span>{item.title}</span>
                      </div>

                      <button
                        onClick={() => handleCopy(item.key, item.url)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copied Link!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </p>

                    <div className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 break-all select-all">
                      {item.url}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <button
            onClick={() => setIsShareModalOpen(false)}
            className="px-5 py-2 text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, Building2, UserCheck, LogOut, Database, RefreshCw, FileSignature, Code2 } from 'lucide-react';
import { CCS_JV_LOGO_BASE64 } from '../assets/logo';

interface HeaderProps {
  totalTravelers: number;
  readyCount: number;
  currentUser?: string;
  dbSyncStatus?: 'synced' | 'saving' | 'error';
  onOpenDatabaseModal?: () => void;
  onOpenSignatureModal?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalTravelers,
  readyCount,
  currentUser = 'AdminE&C',
  dbSyncStatus = 'synced',
  onOpenDatabaseModal,
  onOpenSignatureModal,
  onLogout
}) => {
  return (
    <header className="bg-zinc-900 text-zinc-100 border-b border-zinc-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            {/* Official Logo Box */}
            <div className="h-10 px-2 rounded-xl bg-white flex items-center justify-center shadow-lg border border-zinc-700/60 overflow-hidden">
              <img
                src={CCS_JV_LOGO_BASE64}
                alt="CCS JV Logo"
                className="h-7 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-zinc-100 flex items-center gap-1">
                  CCS JV <span className="text-indigo-400 font-bold">TAF</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  Batch Generator
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Travel & Accommodation Request — Site Travel Automation
              </p>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            {onOpenSignatureModal && (
              <button
                onClick={onOpenSignatureModal}
                className="p-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 rounded-lg border border-indigo-700/60 transition-colors"
                title="Signature & Automation Scripts"
              >
                <FileSignature className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{totalTravelers} loaded</span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-red-400 rounded-lg border border-zinc-700 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Info Badges & User Profile */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          {/* Signature & Automation Code Hub Button */}
          {onOpenSignatureModal && (
            <button
              id="header-signature-automation-btn"
              onClick={onOpenSignatureModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/70 hover:bg-indigo-900 text-indigo-200 hover:text-white border border-indigo-700/70 hover:border-indigo-500 rounded-lg transition-all font-medium cursor-pointer shadow-sm"
              title="Configure automated signature appending and view Python & Google Docs API scripts"
            >
              <FileSignature className="w-3.5 h-3.5 text-indigo-400" />
              <span>Signature & Automation Scripts</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-zinc-800/80 border border-zinc-700/80 px-3 py-1.5 rounded-lg">
            <Building2 className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400">Project:</span>
            <span className="font-semibold text-zinc-200">Mozambique LNG</span>
          </div>

          {totalTravelers > 0 && (
            <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1.5 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-indigo-200 font-bold">{readyCount} of {totalTravelers} Ready</span>
            </div>
          )}

          {/* User Profile Badge & Logout */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-700/80">
            <div className="flex items-center gap-2 bg-zinc-800/90 border border-zinc-700 px-2.5 py-1.5 rounded-lg">
              <div className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300">
                <UserCheck className="w-3 h-3" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-zinc-200 text-[11px] leading-none">{currentUser}</p>
                <p className="text-[9.5px] text-zinc-400 leading-tight">Daewoo E&C</p>
              </div>
            </div>

            {onLogout && (
              <button
                id="header-logout-btn"
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800/80 hover:bg-red-950/50 text-zinc-400 hover:text-red-300 border border-zinc-700/80 hover:border-red-800/60 rounded-lg transition-all text-xs font-medium cursor-pointer"
                title="Log out of session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

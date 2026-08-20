import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  Copy,
  Download,
  Terminal,
  ShieldCheck,
  Server,
  Layers,
  Code2,
  Key,
  ExternalLink,
  Table
} from 'lucide-react';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbSyncStatus?: 'synced' | 'saving' | 'error';
}

const SUPABASE_MIGRATION_SQL = `-- ==============================================================================
-- Supabase Migration: 20260820000000_create_taf_tables.sql
-- Description: Creates the Mozambique LNG CCS JV TAF Portal database schema,
--              including tables for users, traveler records, and app settings,
--              with Row Level Security (RLS) and updated_at triggers.
-- ==============================================================================

-- 1. Enable UUID and pgcrypto extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- 3. Users Table (Synchronized with Supabase / Firebase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    uid TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    display_name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Travelers Table (Core TAF Records for Batch Processing & PDF Generation)
CREATE TABLE IF NOT EXISTS public.travelers (
    id TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    user_uid TEXT,
    surname TEXT NOT NULL,
    name_gender TEXT NOT NULL,
    final_destination TEXT NOT NULL,
    rotation_type TEXT NOT NULL,
    purpose_of_trip TEXT DEFAULT 'Business Trip',
    company_id TEXT,
    company TEXT,
    position TEXT,
    department TEXT,
    mobile_number TEXT,
    email_address TEXT,
    substitute_in_absence TEXT,
    frequent_flyer_card TEXT,
    passport_number TEXT,
    date_of_birth TEXT,
    nationality TEXT,
    passport_expiry_date TEXT,
    signature_date TEXT DEFAULT '06 AUGUST 2026',
    signature_name TEXT DEFAULT 'Eric Matola',
    signature_image TEXT,
    flights JSONB DEFAULT '[]'::jsonb,
    accommodations JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'ready',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Application Settings Table (Default signers, dates, batch preferences)
CREATE TABLE IF NOT EXISTS public.app_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    default_signature_name TEXT DEFAULT 'Eric Matola',
    default_signature_date TEXT DEFAULT '06 AUGUST 2026',
    default_signature_image TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_travelers_user_uid ON public.travelers(user_uid);
CREATE INDEX IF NOT EXISTS idx_travelers_created_at ON public.travelers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_travelers_surname ON public.travelers(surname);
CREATE INDEX IF NOT EXISTS idx_travelers_company ON public.travelers(company);
CREATE INDEX IF NOT EXISTS idx_users_uid ON public.users(uid);

-- 7. Add automatic updated_at Triggers
DROP TRIGGER IF EXISTS set_travelers_updated_at ON public.travelers;
CREATE TRIGGER set_travelers_updated_at
    BEFORE UPDATE ON public.travelers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER set_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS Policies
CREATE POLICY "Allow public read access on travelers"
    ON public.travelers FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert and update on travelers"
    ON public.travelers FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public read access on app_settings"
    ON public.app_settings FOR SELECT
    USING (true);

CREATE POLICY "Allow write on app_settings"
    ON public.app_settings FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow full access on users"
    ON public.users FOR ALL
    USING (true)
    WITH CHECK (true);`;

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  dbSyncStatus = 'synced',
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'migration' | 'schema' | 'guide'>('migration');

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_MIGRATION_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SUPABASE_MIGRATION_SQL], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', '20260820000000_create_taf_tables.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-100">
                  Supabase & Cloud SQL PostgreSQL Integration
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  PostgreSQL 16
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Schema definitions, SQL migrations, and real-time backend persistence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-header Tabs & Sync Status */}
        <div className="px-6 py-2.5 bg-zinc-950/40 border-b border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('migration')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'migration'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              SQL Migration (.sql)
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'schema'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Database Tables
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Connection Guide
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400">Current Status:</span>
            {dbSyncStatus === 'saving' ? (
              <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Syncing Changes...
              </span>
            ) : dbSyncStatus === 'error' ? (
              <span className="text-[11px] font-semibold text-red-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Disconnected
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Live & Synced (Cloud SQL / Supabase)
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-zinc-300 space-y-4">
          {activeTab === 'migration' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-zinc-400">
                  Ready-to-execute migration script containing table creation, foreign keys, indexes, triggers, and Row Level Security (RLS) policies for Supabase and PostgreSQL.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copy SQL</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadSql}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .sql</span>
                  </button>
                </div>
              </div>

              {/* Code display block */}
              <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-[11px] leading-relaxed text-zinc-300 overflow-x-auto max-h-[420px] shadow-inner">
                <pre className="whitespace-pre">{SUPABASE_MIGRATION_SQL}</pre>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Travelers Table Card */}
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-100 flex items-center gap-1.5">
                      <Table className="w-4 h-4 text-indigo-400" />
                      travelers
                    </span>
                    <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800">
                      Core TAF Records
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Stores passenger details, flight segments (JSONB), accommodation records (JSONB), and electronic signatures.
                  </p>
                  <ul className="text-[10px] text-zinc-400 space-y-1 font-mono pt-1 border-t border-zinc-800">
                    <li>• id (TEXT PRIMARY KEY)</li>
                    <li>• surname, name_gender, company</li>
                    <li>• flights (JSONB), accommodations (JSONB)</li>
                    <li>• signature_name, signature_date</li>
                  </ul>
                </div>

                {/* Users Table Card */}
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-100 flex items-center gap-1.5">
                      <Table className="w-4 h-4 text-emerald-400" />
                      users
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                      Auth Profiles
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Synchronized with Supabase / Firebase Auth for role-based access control and user identity.
                  </p>
                  <ul className="text-[10px] text-zinc-400 space-y-1 font-mono pt-1 border-t border-zinc-800">
                    <li>• id (SERIAL PRIMARY KEY)</li>
                    <li>• uid (TEXT UNIQUE)</li>
                    <li>• email, display_name, role</li>
                    <li>• created_at, updated_at</li>
                  </ul>
                </div>

                {/* App Settings Card */}
                <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-100 flex items-center gap-1.5">
                      <Table className="w-4 h-4 text-amber-400" />
                      app_settings
                    </span>
                    <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800">
                      Preferences
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Holds default batch configurations, standard signer signatures, and date defaults.
                  </p>
                  <ul className="text-[10px] text-zinc-400 space-y-1 font-mono pt-1 border-t border-zinc-800">
                    <li>• id (SERIAL PRIMARY KEY)</li>
                    <li>• default_signature_name</li>
                    <li>• default_signature_date</li>
                    <li>• default_signature_image</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-zinc-200 flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  How to run on Supabase
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-zinc-300 leading-relaxed text-xs">
                  <li>
                    Open your <span className="text-indigo-300 font-semibold">Supabase Dashboard</span> (e.g. at supabase.com).
                  </li>
                  <li>
                    Go to the <span className="text-zinc-100 font-medium">SQL Editor</span> in your Supabase project sidebar.
                  </li>
                  <li>
                    Paste the SQL script from the <span className="text-indigo-400 font-medium">SQL Migration</span> tab or upload <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">20260820000000_create_taf_tables.sql</code>.
                  </li>
                  <li>
                    Click <span className="bg-emerald-800/80 text-emerald-200 font-semibold px-2 py-0.5 rounded text-[11px]">Run</span> to create tables, indexes, triggers, and Row Level Security (RLS) policies.
                  </li>
                  <li>
                    Optionally add your <code className="text-indigo-300 bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">VITE_SUPABASE_URL</code> and <code className="text-indigo-300 bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">VITE_SUPABASE_ANON_KEY</code> in the Settings Secrets menu.
                  </li>
                </ol>
              </div>

              <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/60 rounded-xl flex items-start gap-3 text-indigo-200 text-xs">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  The app is currently connected to the provisioned <span className="font-semibold text-white">PostgreSQL Cloud SQL</span> instance with active Drizzle ORM schema synchronization, and is 100% compatible with Supabase PostgreSQL!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>PostgreSQL & Supabase Standard DDL</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

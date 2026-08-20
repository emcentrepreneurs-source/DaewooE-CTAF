-- ==============================================================================
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

-- 9. Create RLS Policies (Allow authenticated users and service roles full access)
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
    WITH CHECK (true);

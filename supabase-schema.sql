-- Supabase Schema for DailyGrid
-- This schema satisfies all personal tracking specifications.

-- Enable UUID extension (though we're using custom text IDs generated client-side/server-side for now)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------------------------------------
-- 1. HABITS TABLE
-------------------------------------------------------------------------------
CREATE TABLE habits (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    frequency TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived BOOLEAN NOT NULL DEFAULT false
);

-------------------------------------------------------------------------------
-- 2. HABIT COMPLETIONS TABLE
-------------------------------------------------------------------------------
CREATE TABLE habit_completions (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date TEXT NOT NULL, -- Format: YYYY-MM-DD
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT habit_completions_unique_habit_date UNIQUE (habit_id, date)
);

-- Index for querying completions by date range and habit
CREATE INDEX idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX idx_habit_completions_date ON habit_completions(date);

-------------------------------------------------------------------------------
-- 3. INTEGRATIONS TABLE
-------------------------------------------------------------------------------
CREATE TABLE integrations (
    id TEXT PRIMARY KEY, -- 'github' or 'leetcode'
    provider TEXT NOT NULL,
    username TEXT NOT NULL,
    access_token TEXT, -- Optional encrypted token, retrieved only via server route
    connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ,
    sync_status TEXT NOT NULL DEFAULT 'idle', -- 'idle', 'syncing', 'error', 'success'
    sync_error TEXT,
    include_in_overall_heatmap BOOLEAN NOT NULL DEFAULT false
);

-------------------------------------------------------------------------------
-- 4. EXTERNAL ACTIVITY TABLE
-------------------------------------------------------------------------------
CREATE TABLE external_activity (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    date TEXT NOT NULL, -- Format: YYYY-MM-DD
    count INTEGER NOT NULL DEFAULT 0,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT external_activity_unique_provider_date UNIQUE (provider, date)
);

-- Index for fetching activity by provider and date
CREATE INDEX idx_external_activity_provider ON external_activity(provider);
CREATE INDEX idx_external_activity_date ON external_activity(date);


-------------------------------------------------------------------------------
-- SECURITY & RLS POLICIES
-------------------------------------------------------------------------------
-- Since the frontend will NEVER connect directly to Supabase, we can enable RLS
-- and lock down all public access. The Vercel API routes will use the 
-- SUPABASE_SERVICE_ROLE_KEY to bypass RLS and perform operations securely.

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_activity ENABLE ROW LEVEL SECURITY;

-- We don't create any public policies. Public access is entirely denied.
-- Only the Service Role (used by our Vercel /api routes) can read/write data.

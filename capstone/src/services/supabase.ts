import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getAppSettings } from './db';

let supabaseClientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseClientInstance) return supabaseClientInstance;

  const settings = getAppSettings();
  const url = import.meta.env.VITE_SUPABASE_URL || settings.supabaseUrl;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || settings.supabaseAnonKey;

  if (url && anonKey) {
    try {
      supabaseClientInstance = createClient(url, anonKey);
      return supabaseClientInstance;
    } catch (e) {
      console.warn('Could not initialize Supabase client:', e);
      return null;
    }
  }

  return null;
};

export const isSupabaseConfigured = (): boolean => {
  const settings = getAppSettings();
  const url = import.meta.env.VITE_SUPABASE_URL || settings.supabaseUrl;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || settings.supabaseAnonKey;
  return Boolean(url && anonKey);
};

export const resetSupabaseClient = () => {
  supabaseClientInstance = null;
};

// SQL Schema generator for users to copy-paste into Supabase SQL editor
export const SUPABASE_SQL_SCHEMA = `-- INTELLIGENT FILE ORGANIZER SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor to enable cloud sync

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan TEXT DEFAULT 'Free' CHECK (plan IN ('Free', 'Pro', 'Enterprise')),
  storage_quota BIGINT DEFAULT 5368709120, -- 5GB
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Folders Table
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Files Table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT,
  extension TEXT,
  category TEXT NOT NULL,
  hash_sha256 TEXT NOT NULL,
  last_modified BIGINT,
  storage_path TEXT,
  ai_category TEXT,
  ai_suggested_folder TEXT,
  ai_confidence INT,
  ai_reason TEXT,
  is_duplicate BOOLEAN DEFAULT FALSE,
  duplicate_group_id UUID,
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Duplicate Groups Table
CREATE TABLE IF NOT EXISTS duplicate_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hash_sha256 TEXT NOT NULL,
  file_count INT NOT NULL,
  total_size BIGINT NOT NULL,
  wasted_size BIGINT NOT NULL,
  original_file_id UUID,
  category TEXT,
  similarity_type TEXT DEFAULT 'exact_sha256',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Scan History Table
CREATE TABLE IF NOT EXISTS scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  files_scanned INT NOT NULL,
  duplicates_found INT NOT NULL,
  savings_found BIGINT NOT NULL,
  duration_ms INT NOT NULL,
  scope TEXT DEFAULT 'All Files',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'success',
  file_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only read & write their own data
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own folders" ON folders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own files" ON files FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own duplicate_groups" ON duplicate_groups FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own scan_history" ON scan_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own activity_logs" ON activity_logs FOR ALL USING (auth.uid() = user_id);
`;

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUPABASE_SQL_SCHEMA, isSupabaseConfigured } from '../services/supabase';
import { OrganizationRule } from '../types';
import {
  Settings,
  Moon,
  Sun,
  Shield,
  Database,
  Key,
  Copy,
  Check,
  Sparkles,
  Trash2,
  RotateCcw,
  Sliders,
  CheckCircle2,
  FolderTree,
  Plus,
  X
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    theme,
    setTheme,
    clearAllData,
    rules,
    addRule,
    deleteRule,
    addNotification
  } = useApp();

  const [copiedSql, setCopiedSql] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(settings.supabaseUrl || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(settings.supabaseAnonKey || '');

  // Add rule modal state
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [conditionType, setConditionType] = useState<'extension' | 'name_contains' | 'category'>('extension');
  const [conditionValue, setConditionValue] = useState('');
  const [targetFolder, setTargetFolder] = useState('');

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !conditionValue.trim() || !targetFolder.trim()) return;

    const newRule: OrganizationRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newRuleName.trim(),
      conditionType,
      conditionValue: conditionValue.trim(),
      targetFolder: targetFolder.trim(),
      enabled: true,
      priority: rules.length + 1
    };

    await addRule(newRule);
    setNewRuleName('');
    setConditionValue('');
    setTargetFolder('');
    setShowAddRuleModal(false);
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      supabaseUrl: supabaseUrlInput.trim(),
      supabaseAnonKey: supabaseKeyInput.trim()
    });
  };

  const copySqlSchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
    addNotification('SQL Schema Copied', 'Paste into your Supabase SQL Editor.', 'info');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>System & Organization Preferences</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Settings & Configurations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage deduplication sensitivity, visual theme, custom folder routing rules, and cloud database connection.
        </p>
      </div>

      {/* Theme & Display Preferences */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Appearance & Theme</h3>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
              theme === 'light'
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sun className="w-6 h-6 text-amber-500" />
            <span className="text-xs">Light Mode</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-400 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Moon className="w-6 h-6 text-indigo-400" />
            <span className="text-xs">Dark Mode</span>
          </button>
        </div>
      </div>

      {/* Deduplication & Organization Engine Settings */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Duplicate Detection Engine</h3>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.strictHashOnly}
              onChange={(e) => updateSettings({ strictHashOnly: e.target.checked })}
              className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-0 cursor-pointer"
            />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Strict SHA-256 Hash Mode Only</p>
              <p className="text-[11px] text-slate-500">
                When enabled, duplicates are strictly identified if their cryptographic SHA-256 digests match bit-for-bit. (Disables heuristic name copy clustering).
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableAiSuggestions}
              onChange={(e) => updateSettings({ enableAiSuggestions: e.target.checked })}
              className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-0 cursor-pointer"
            />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">AI Semantic Classification & Folder Suggestions</p>
              <p className="text-[11px] text-slate-500">
                Automatically generate topic-based hierarchical folder targets (e.g. Academic / Assignments / Machine Learning) during file upload.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Custom Organization Rules */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Custom Routing Rules</h3>
            <p className="text-xs text-slate-500">Automated directory mapping triggers</p>
          </div>
          <button
            onClick={() => setShowAddRuleModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Rule</span>
          </button>
        </div>

        <div className="space-y-2">
          {rules.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500">No custom rules configured. Files are routed using AI neural classification.</p>
            </div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 dark:text-white">{rule.name}</p>
                  <p className="text-[11px] text-slate-500">
                    If {rule.conditionType} contains "{rule.conditionValue}" → Route to <span className="font-semibold text-blue-600 dark:text-blue-400">{rule.targetFolder}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Enabled
                  </span>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition"
                    title="Delete rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Rule Modal */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <form
            onSubmit={handleCreateRule}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">New Routing Rule</h3>
              <button type="button" onClick={() => setShowAddRuleModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Rule Name</label>
              <input
                type="text"
                required
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                placeholder="e.g. Route Screenshots"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border-transparent focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Condition Type</label>
                <select
                  value={conditionType}
                  onChange={(e) => setConditionType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border-transparent focus:outline-none"
                >
                  <option value="extension">File Extension</option>
                  <option value="name_contains">Name Contains</option>
                  <option value="category">Category</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Match Value</label>
                <input
                  type="text"
                  required
                  value={conditionValue}
                  onChange={(e) => setConditionValue(e.target.value)}
                  placeholder="e.g. png, invoice, Images"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Target Folder Path</label>
              <input
                type="text"
                required
                value={targetFolder}
                onChange={(e) => setTargetFolder(e.target.value)}
                placeholder="e.g. Images / Screenshots"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border-transparent focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddRuleModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25"
              >
                Create Rule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Supabase Cloud Sync Configuration */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Supabase Cloud Database</h3>
              <p className="text-xs text-slate-500">Connect your PostgreSQL cloud instance for multi-device sync</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            isSupabaseConfigured()
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {isSupabaseConfigured() ? 'Connected' : 'Local IndexedDB Mode'}
          </span>
        </div>

        <form onSubmit={handleSaveSupabaseConfig} className="space-y-3 pt-2">
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Supabase Project URL</label>
            <input
              type="text"
              value={supabaseUrlInput}
              onChange={(e) => setSupabaseUrlInput(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono border-transparent focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Supabase Anon Public API Key</label>
            <input
              type="password"
              value={supabaseKeyInput}
              onChange={(e) => setSupabaseKeyInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono border-transparent focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={copySqlSchema}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1.5"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'SQL Copied!' : 'Copy Supabase SQL Setup Schema'}</span>
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition"
            >
              Save Cloud Settings
            </button>
          </div>
        </form>
      </div>

      {/* Data Management & Reset */}
      <div className="p-6 rounded-3xl glass-card border border-red-200/40 dark:border-red-950/40 space-y-4">
        <h3 className="text-base font-bold text-red-600 dark:text-red-400">Data Management & Reset</h3>
        <p className="text-xs text-slate-500">
          Reset local workspace data and clear all indexed files.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to completely erase all local indexed files and records?')) {
                clearAllData();
              }
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-800 transition flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Local Workspace Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

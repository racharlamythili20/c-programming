import React from 'react';
import { useApp } from '../context/AppContext';
import { formatBytes, formatDate } from '../services/fileProcessor';
import { StorageSphere3D } from '../components/three/StorageSphere3D';
import {
  HardDrive,
  PieChart,
  TrendingDown,
  Trash2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkles,
  FileText,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

export const StorageAnalyzerPage: React.FC = () => {
  const {
    files,
    duplicateGroups,
    currentUser,
    setSelectedFileForPreview,
    deleteFiles,
    setActiveTab
  } = useApp();

  const totalUsedBytes = files.reduce((acc, f) => acc + f.size, 0);
  const quotaBytes = currentUser?.storageQuota || 25 * 1024 * 1024 * 1024;
  const availableBytes = Math.max(quotaBytes - totalUsedBytes, 0);
  const totalWastedBytes = duplicateGroups.reduce((acc, g) => acc + g.wastedSize, 0);

  // Largest files (> 0 bytes, sorted descending)
  const largestFiles = [...files].sort((a, b) => b.size - a.size).slice(0, 7);

  // Inactive / Old files (> 180 days)
  const halfYearAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;
  const oldFiles = files.filter(f => f.lastModified < halfYearAgo);
  const oldFilesBytes = oldFiles.reduce((acc, f) => acc + f.size, 0);

  // Temporary files
  const tempFiles = files.filter(f => {
    const n = f.name.toLowerCase();
    return n.endsWith('.tmp') || n.endsWith('.bak') || n.startsWith('~$') || n === '.ds_store' || n === 'thumbs.db';
  });
  const tempFilesBytes = tempFiles.reduce((acc, f) => acc + f.size, 0);

  // Category breakdown for horizontal treemap/barchart
  const categoryMap: { [key: string]: number } = {};
  files.forEach(f => {
    categoryMap[f.category] = (categoryMap[f.category] || 0) + f.size;
  });

  const categoryBarData = Object.keys(categoryMap).map(cat => ({
    name: cat,
    sizeBytes: categoryMap[cat],
    formatted: formatBytes(categoryMap[cat]),
    percent: totalUsedBytes > 0 ? Math.round((categoryMap[cat] / totalUsedBytes) * 100) : 0
  })).sort((a, b) => b.sizeBytes - a.sizeBytes);

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#6366f1', '#64748b'];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
            <PieChart className="w-3.5 h-3.5" />
            <span>Storage Capacity & Optimization Radar</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Storage Analyzer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time storage topology of user-selected local files and cloud allocation.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('cleanup')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center gap-2 self-start"
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>Launch Cleanup Assistant</span>
        </button>
      </div>

      {/* Browser Scope Notice (Requirement #8 & #22) */}
      <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <span className="font-bold text-slate-900 dark:text-white">Browser Security & Scope Architecture: </span>
          Web applications operate in a sandboxed security model and analyze files explicitly selected by you or dropped from directories. Storage stats reflect your active IndexedDB/Cloud dataset and your configured quota ({formatBytes(quotaBytes)}).
        </div>
      </div>

      {/* Top 3D Visualization & Capacity Rings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* 3D Sphere Interactive Core */}
        <div className="lg:col-span-7 rounded-3xl glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Orbital Data Core
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Live 3D Storage Sphere
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Optimal Condition
            </span>
          </div>

          <StorageSphere3D
            usedBytes={totalUsedBytes}
            totalQuotaBytes={quotaBytes}
            duplicateBytes={totalWastedBytes}
            fileCount={files.length}
          />
        </div>

        {/* Capacity Breakdown Gauge Card */}
        <div className="lg:col-span-5 rounded-3xl glass-card p-6 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Allocation Overview
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Capacity Utilization
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {formatBytes(totalUsedBytes)}
              </span>
              <span className="text-xs text-slate-400">
                of {formatBytes(quotaBytes)} allocated
              </span>
            </div>

            {/* Segmented Bar */}
            <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${Math.min((totalUsedBytes / quotaBytes) * 100, 100)}%` }}
                title="Used Space"
              />
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${Math.min((totalWastedBytes / quotaBytes) * 100, 30)}%` }}
                title="Duplicate Space"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Active Files ({formatBytes(totalUsedBytes - totalWastedBytes)})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Duplicates ({formatBytes(totalWastedBytes)})
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Available Free Space:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatBytes(availableBytes)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Dormant Files (&gt;180 Days):</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{formatBytes(oldFilesBytes)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Temporary Cache / System Files:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{formatBytes(tempFilesBytes)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Consumption Breakdown Bar Chart */}
      <div className="rounded-3xl glass-card p-6 space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Storage Treemap
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Storage Consumed by File Category
          </h3>
        </div>

        <div className="space-y-3 pt-2">
          {categoryBarData.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No categorized files in storage yet.</p>
          ) : (
            categoryBarData.map((cat, idx) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                  <span className="text-slate-500">{cat.formatted} ({cat.percent}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(cat.percent, 2)}%`,
                      backgroundColor: colors[idx % colors.length]
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Largest Files Ranking */}
      <div className="rounded-3xl glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
              Storage Consumers
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Largest Files Ranking
            </h3>
          </div>
          <span className="text-xs text-slate-400">Review files occupying highest space</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {largestFiles.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No files indexed in workspace yet.</p>
          ) : (
            largestFiles.map((file, idx) => (
              <div
                key={file.id}
                onClick={() => setSelectedFileForPreview(file)}
                className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 p-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-500">{file.category} • {file.folderPath || 'Root'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatBytes(file.size)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete large file "${file.name}"?`)) deleteFiles([file.id]);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Delete this file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

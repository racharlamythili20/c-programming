import React from 'react';
import { useApp } from '../context/AppContext';
import { formatBytes, formatDate } from '../services/fileProcessor';
import { StorageSphere3D } from '../components/three/StorageSphere3D';
import {
  FileText,
  FolderOpen,
  Copy,
  HardDrive,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export const DashboardOverview: React.FC = () => {
  const {
    files,
    folders,
    duplicateGroups,
    activityLogs,
    scanHistory,
    currentUser,
    setActiveTab,
    runDuplicateScan,
    setSelectedFileForPreview
  } = useApp();

  const totalFiles = files.length;
  const totalFolders = folders.length;
  const duplicateFilesCount = duplicateGroups.reduce((acc, g) => acc + g.duplicateFileIds.length, 0);
  const totalUsedBytes = files.reduce((acc, f) => acc + f.size, 0);
  const totalWastedBytes = duplicateGroups.reduce((acc, g) => acc + g.wastedSize, 0);
  const unorganizedFiles = files.filter(f => !f.folderPath || f.folderPath === '/' || f.folderPath === 'Root');

  // Category counts and sizes for charts (real file data only)
  const categoryStats: { [key: string]: { count: number; size: number } } = {};
  files.forEach(f => {
    if (!categoryStats[f.category]) {
      categoryStats[f.category] = { count: 0, size: 0 };
    }
    categoryStats[f.category].count += 1;
    categoryStats[f.category].size += f.size;
  });

  const categoryColors: { [key: string]: string } = {
    'PDFs': '#ef4444',
    'Documents': '#3b82f6',
    'Spreadsheets': '#10b981',
    'Presentations': '#f59e0b',
    'Images': '#ec4899',
    'Videos': '#8b5cf6',
    'Audio': '#a855f7',
    'Archives': '#6366f1',
    'Programming Files': '#06b6d4',
    'Other Files': '#64748b'
  };

  const pieData = Object.keys(categoryStats).map(cat => ({
    name: cat,
    value: categoryStats[cat].count,
    size: categoryStats[cat].size,
    color: categoryColors[cat] || '#3b82f6'
  }));

  // Duplicate analysis by category
  const duplicateByCategory: { [key: string]: number } = {};
  duplicateGroups.forEach(g => {
    duplicateByCategory[g.category] = (duplicateByCategory[g.category] || 0) + g.duplicateFileIds.length;
  });

  const duplicateBarData = Object.keys(duplicateByCategory).map(cat => ({
    category: cat,
    duplicates: duplicateByCategory[cat]
  }));

  // Dynamic monthly activity aggregation from real activity logs & scans
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  const past6Months = Array.from({ length: 6 }, (_, i) => {
    const idx = (currentMonthIdx - 5 + i + 12) % 12;
    return months[idx];
  });

  const monthlyTrendData = past6Months.map(m => {
    const orgCount = activityLogs.filter(l => {
      const logMonth = months[new Date(l.timestamp).getMonth()];
      return logMonth === m && (l.action === 'ORGANIZE' || l.action === 'UPLOAD');
    }).length;

    const dupCount = scanHistory.filter(s => {
      const scanMonth = months[new Date(s.timestamp).getMonth()];
      return scanMonth === m;
    }).reduce((acc, s) => acc + s.duplicatesFound, 0);

    return {
      month: m,
      organized: orgCount,
      duplicatesFound: dupCount
    };
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Autonomous Intelligence Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back{currentUser ? `, ${currentUser.fullName.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            AutoFile AI has indexed your local library. {duplicateFilesCount} redundant duplicates and {unorganizedFiles.length} unorganized files need your review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => runDuplicateScan()}
            className="px-5 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-md hover:scale-105 transition flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current text-amber-500" />
            <span>1-Click Scan</span>
          </button>
          <button
            onClick={() => setActiveTab('organizer')}
            className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-semibold backdrop-blur-md transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Auto-Sort</span>
          </button>
        </div>

        {/* Decorative backdrop glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -z-0 pointer-events-none" />
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl glass-card space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Files</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalFiles}
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Indexed in storage
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl glass-card space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Folders</span>
            <FolderOpen className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalFolders}
          </div>
          <p className="text-[10px] text-slate-500">Categorized paths</p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl glass-card space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Duplicates</span>
            <Copy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {duplicateFilesCount}
          </div>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
            {duplicateGroups.length} duplicate groups
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl glass-card space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Storage Used</span>
            <HardDrive className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatBytes(totalUsedBytes)}
          </div>
          <p className="text-[10px] text-slate-500">Active indexed data</p>
        </div>

        {/* Metric 5 */}
        <div className="p-4 rounded-2xl glass-card space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Wasted Space</span>
            <ShieldCheck className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-extrabold text-red-500">
            {formatBytes(totalWastedBytes)}
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Reclaimable instantly
          </p>
        </div>

        {/* Metric 6 */}
        <div className="p-4 rounded-2xl glass-card space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Unorganized</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {unorganizedFiles.length}
          </div>
          <p className="text-[10px] text-slate-500">Files sitting in root</p>
        </div>
      </div>

      {/* Main Center Grid: 3D Storage Core + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive 3D Storage Core */}
        <div className="lg:col-span-7 rounded-3xl glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">3D Dynamic Topology</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Storage Orb & Data Cluster</h3>
            </div>
            <button
              onClick={() => setActiveTab('storage')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3D Canvas */}
          <StorageSphere3D
            usedBytes={totalUsedBytes}
            totalQuotaBytes={currentUser?.storageQuota || 25 * 1024 * 1024 * 1024}
            duplicateBytes={totalWastedBytes}
            fileCount={totalFiles}
          />

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Active Files</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{totalFiles}</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Reclaimable</p>
              <p className="text-sm font-bold text-emerald-600">{formatBytes(totalWastedBytes)}</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Health Score</p>
              <p className="text-sm font-bold text-blue-600">
                {totalFiles === 0 ? 100 : Math.max(100 - duplicateFilesCount * 5 - unorganizedFiles.length * 2, 40)} / 100
              </p>
            </div>
          </div>
        </div>

        {/* Right: File Category Distribution Pie */}
        <div className="lg:col-span-5 rounded-3xl glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Breakdown</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">File Type Distribution</h3>
            </div>
            <button
              onClick={() => setActiveTab('files')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              View Files
            </button>
          </div>

          <div className="h-[280px] w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any, item: any) => [
                      `${value} files (${formatBytes(item.payload.size)})`,
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No files indexed yet</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
            {pieData.slice(0, 6).map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphs Row 2: Monthly Trends & Duplicate Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monthly Activity Area Chart */}
        <div className="lg:col-span-7 rounded-3xl glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Trend Analysis</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Organization & Duplicate Activity</h3>
            </div>
            <span className="text-xs text-slate-400">Last 6 Months</span>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorDup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="organized" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOrg)" name="Files Organized" />
                <Area type="monotone" dataKey="duplicatesFound" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDup)" name="Duplicates Purged" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Duplicate Categories Bar Chart */}
        <div className="lg:col-span-5 rounded-3xl glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Duplicate Distribution</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Duplicates by Category</h3>
            </div>
            <button
              onClick={() => setActiveTab('duplicates')}
              className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline"
            >
              Scan & Clean
            </button>
          </div>

          <div className="h-[240px] w-full">
            {duplicateBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={duplicateBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="duplicates" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Duplicate Copies" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No duplicate copies found. Storage clean!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Files & Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recently Uploaded / Organized Files */}
        <div className="lg:col-span-7 rounded-3xl glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Recently Processed Files
            </h3>
            <button
              onClick={() => setActiveTab('files')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              View All ({files.length})
            </button>
          </div>

          <div className="space-y-2">
            {files.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No files processed yet</p>
                <button
                  onClick={() => setActiveTab('files')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-bold shadow-sm"
                >
                  Upload First File
                </button>
              </div>
            ) : (
              files.slice(0, 5).map((file) => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFileForPreview(file)}
                  className="p-3 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition cursor-pointer flex items-center justify-between gap-3 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {formatBytes(file.size)} • {file.category} • {file.folderPath || 'Root'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {file.isDuplicate && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                        Duplicate
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Log Stream */}
        <div className="lg:col-span-5 rounded-3xl glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Activity Stream
            </h3>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Full Log
            </button>
          </div>

          <div className="space-y-3">
            {activityLogs.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 space-y-1">
                <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No activity logged yet</p>
                <p className="text-[10px] text-slate-400">File uploads, scans, and reorganizations will appear here.</p>
              </div>
            ) : (
              activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/60 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{log.title}</span>
                    <span className="text-slate-400">{formatDate(log.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{log.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

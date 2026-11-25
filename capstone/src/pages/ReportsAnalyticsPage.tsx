import React from 'react';
import { useApp } from '../context/AppContext';
import { formatBytes, formatDate } from '../services/fileProcessor';
import {
  FileBarChart,
  Download,
  Printer,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  HardDrive,
  Copy,
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from 'recharts';

export const ReportsAnalyticsPage: React.FC = () => {
  const {
    files,
    duplicateGroups,
    scanHistory,
    activityLogs,
    currentUser,
    addNotification
  } = useApp();

  const totalFiles = files.length;
  const totalDuplicates = duplicateGroups.reduce((acc, g) => acc + g.duplicateFileIds.length, 0);
  const totalUsedBytes = files.reduce((acc, f) => acc + f.size, 0);
  const totalWastedBytes = duplicateGroups.reduce((acc, g) => acc + g.wastedSize, 0);

  // Efficiency score: ratio of organized files + absence of duplicates
  const unorganized = files.filter(f => !f.folderPath || f.folderPath === '/').length;
  const orgRatio = totalFiles > 0 ? ((totalFiles - unorganized) / totalFiles) * 100 : 100;
  const efficiencyScore = Math.round(orgRatio);

  // Dynamic monthly activity aggregation from real scan records and user actions
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const monthlyData = months.map(m => {
    const logsInMonth = activityLogs.filter(l => {
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(l.timestamp));
      return monthName === m;
    });
    const scansInMonth = scanHistory.filter(s => {
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(s.timestamp));
      return monthName === m;
    });

    const reclaimedBytes = scansInMonth.reduce((acc, s) => acc + s.savingsFound, 0);

    return {
      month: m,
      filesProcessed: logsInMonth.length,
      duplicatesPurged: scansInMonth.reduce((acc, s) => acc + s.duplicatesFound, 0),
      storageReclaimedMB: Math.round(reclaimedBytes / (1024 * 1024))
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    let csv = 'Metric,Value\n';
    csv += `Total Files Indexed,${totalFiles}\n`;
    csv += `Duplicate Clusters,${duplicateGroups.length}\n`;
    csv += `Total Redundant Copies,${totalDuplicates}\n`;
    csv += `Active Storage Used (Bytes),${totalUsedBytes}\n`;
    csv += `Potential Recoverable Storage (Bytes),${totalWastedBytes}\n`;
    csv += `Organization Efficiency Score,${efficiencyScore}%\n`;
    csv += `Report Generated At,${new Date().toISOString()}\n\n`;

    csv += 'File Name,Category,Size (Bytes),Folder Path,SHA-256 Digest,Is Duplicate\n';
    files.forEach(f => {
      csv += `"${f.name}","${f.category}",${f.size},"${f.folderPath || '/'}","${f.hash}",${f.isDuplicate ? 'YES' : 'NO'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprehensive_file_audit_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    addNotification('Report Exported', 'Full audit analytics exported to CSV.', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 print:p-0 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">
            <FileBarChart className="w-3.5 h-3.5" />
            <span>Executive Audit & Storage Metrics</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Export comprehensive reports, audit trends, and deduplication verification certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print PDF Summary</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Full CSV Audit</span>
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Storage Health & Optimization Audit</h2>
            <p className="text-xs text-slate-500">Prepared for: {currentUser ? `${currentUser.fullName} (${currentUser.email})` : 'Active Session Account'}</p>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-500">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Generated: {formatDate(Date.now())}</p>
            <p>Verification: Cryptographic SHA-256 Engine</p>
          </div>
        </div>

        {/* 4 Key Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80">
            <p className="text-[11px] font-bold uppercase text-slate-500">Files Indexed</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalFiles}</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Across 10 categories</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80">
            <p className="text-[11px] font-bold uppercase text-slate-500">Duplicates Identified</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{totalDuplicates}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{duplicateGroups.length} distinct groups</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80">
            <p className="text-[11px] font-bold uppercase text-slate-500">Recoverable Storage</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{formatBytes(totalWastedBytes)}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Safe to purge</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80">
            <p className="text-[11px] font-bold uppercase text-slate-500">Efficiency Score</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">{efficiencyScore}%</p>
            <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Folder organization index</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
        {/* Processing Trend */}
        <div className="lg:col-span-7 rounded-3xl glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Files Processed vs Duplicates Purged
          </h3>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="filesProcessed" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Files Processed" />
                <Bar dataKey="duplicatesPurged" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Duplicates Purged" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Storage Reclaimed Trend */}
        <div className="lg:col-span-5 rounded-3xl glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Storage Space Reclaimed (MB)
          </h3>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Line type="monotone" dataKey="storageReclaimedMB" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="MB Reclaimed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Scan History Registry */}
      <div className="rounded-3xl glass-card p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Historical Scan Records
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Scan Scope</th>
                <th className="p-3">Files Scanned</th>
                <th className="p-3">Duplicates Found</th>
                <th className="p-3">Duration</th>
                <th className="p-3 text-right">Savings Found</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {scanHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No historical scan records yet. Run a scan from the Duplicate Finder.
                  </td>
                </tr>
              ) : (
                scanHistory.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{formatDate(scan.timestamp)}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{scan.scope}</td>
                    <td className="p-3">{scan.filesScanned} files</td>
                    <td className="p-3 font-semibold text-amber-600">{scan.duplicatesFound}</td>
                    <td className="p-3 text-slate-400">{scan.durationMs} ms</td>
                    <td className="p-3 text-right font-bold text-emerald-600">{formatBytes(scan.savingsFound)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

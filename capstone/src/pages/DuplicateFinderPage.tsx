import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DuplicateGroup } from '../types';
import { formatBytes, formatDate } from '../services/fileProcessor';
import {
  Copy,
  ShieldCheck,
  Zap,
  Trash2,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  CheckSquare,
  Square,
  HardDrive,
  Calendar,
  Layers,
  ArrowRight,
  FileText
} from 'lucide-react';

export const DuplicateFinderPage: React.FC = () => {
  const {
    files,
    duplicateGroups,
    runDuplicateScan,
    deleteFiles,
    setSelectedDuplicateGroupForCompare,
    isScanning,
    scanProgress,
    scanStatusText,
    addNotification
  } = useApp();

  const [scanScope, setScanScope] = useState<'All' | 'Documents' | 'Images' | 'PDFs' | 'LargeFiles'>('All');
  const [selectedGroupCategory, setSelectedGroupCategory] = useState<string>('All');
  const [selectedFileIdsToDelete, setSelectedFileIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Filter groups
  const filteredGroups = duplicateGroups.filter(g => {
    if (selectedGroupCategory === 'All') return true;
    return g.category === selectedGroupCategory;
  });

  const totalDuplicatesCount = duplicateGroups.reduce((acc, g) => acc + g.duplicateFileIds.length, 0);
  const totalWastedBytes = duplicateGroups.reduce((acc, g) => acc + g.wastedSize, 0);

  const handleRunScan = async () => {
    const res = await runDuplicateScan(scanScope);
    // Auto-select all duplicate file IDs (leaving originals safe)
    const allDups = res.flatMap(g => g.duplicateFileIds);
    setSelectedFileIdsToDelete(allDups);
  };

  const selectAllDuplicates = () => {
    const allDups = filteredGroups.flatMap(g => g.duplicateFileIds);
    setSelectedFileIdsToDelete(allDups);
  };

  const deselectAll = () => {
    setSelectedFileIdsToDelete([]);
  };

  const toggleSelectFile = (fileId: string) => {
    if (selectedFileIdsToDelete.includes(fileId)) {
      setSelectedFileIdsToDelete(selectedFileIdsToDelete.filter(id => id !== fileId));
    } else {
      setSelectedFileIdsToDelete([...selectedFileIdsToDelete, fileId]);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedFileIdsToDelete.length === 0) return;
    if (confirm(`Permanently remove ${selectedFileIdsToDelete.length} duplicate copy files? All original source files will be preserved.`)) {
      setIsDeleting(true);
      await deleteFiles(selectedFileIdsToDelete, 'Duplicate Finder batch purge');
      setSelectedFileIdsToDelete([]);
      setIsDeleting(false);
      addNotification('Duplicate Purge Complete', `Reclaimed storage space while preserving all original files.`, 'success');
    }
  };

  // Export Duplicate Report in CSV format
  const exportCsvReport = () => {
    let csv = 'Duplicate Group ID,Original File,Duplicate File,Size (Bytes),Category,SHA-256 Digest,Location\n';
    duplicateGroups.forEach(g => {
      const orig = files.find(f => f.id === g.originalFileId);
      g.duplicateFileIds.forEach(dId => {
        const dup = files.find(f => f.id === dId);
        if (dup) {
          csv += `"${g.id}","${orig?.name || 'Original'}","${dup.name}",${dup.size},"${dup.category}","${dup.hash}","${dup.folderPath || '/'}"\n`;
        }
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duplicate_audit_report_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification('Report Downloaded', 'Duplicate audit exported to CSV format.', 'info');
  };

  // Export JSON Report
  const exportJsonReport = () => {
    const report = {
      scanDate: new Date().toISOString(),
      totalDuplicateGroups: duplicateGroups.length,
      totalDuplicateCopies: totalDuplicatesCount,
      totalWastedStorageBytes: totalWastedBytes,
      groups: duplicateGroups.map(g => {
        const orig = files.find(f => f.id === g.originalFileId);
        const dups = files.filter(f => g.duplicateFileIds.includes(f.id));
        return {
          groupId: g.id,
          hash: g.hash,
          category: g.category,
          original: orig ? { name: orig.name, path: orig.folderPath, size: orig.size } : null,
          duplicates: dups.map(d => ({ name: d.name, path: d.folderPath, size: d.size, modified: d.lastModified }))
        };
      })
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duplicate_audit_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification('Report Downloaded', 'Duplicate audit exported to JSON.', 'info');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <Copy className="w-3.5 h-3.5" />
            <span>Cryptographic Deduplication Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Duplicate File Finder
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Identify exact byte matches using Web Crypto SHA-256 digests. Compare side-by-side and safely reclaim disk space.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2">
          {duplicateGroups.length > 0 && (
            <>
              <button
                onClick={exportCsvReport}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
                title="Export report in CSV spreadsheet format"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV Report</span>
              </button>
              <button
                onClick={exportJsonReport}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
                title="Export report in JSON data format"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </>
          )}

          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning ({scanProgress}%)...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>Scan for Duplicates</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scan Config & Stats Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Stats */}
        <div className="md:col-span-7 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200">
              Audit Status
            </span>
            <span className="text-xs text-slate-500">Method: SHA-256 + Size Normalization</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {duplicateGroups.length} Duplicate Clusters • {totalDuplicatesCount} Redundant Files
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            You can safely reclaim <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatBytes(totalWastedBytes)}</span> by deleting duplicate copies. All primary original files will remain untouched.
          </p>
        </div>

        {/* Scan Scope Filter Switch */}
        <div className="md:col-span-5 flex flex-col items-start md:items-end gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Scan Scope:</span>
            <select
              value={scanScope}
              onChange={(e) => setScanScope(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Indexed Files</option>
              <option value="Documents">Documents & Text</option>
              <option value="Images">Images & Graphics</option>
              <option value="PDFs">PDF Files Only</option>
              <option value="LargeFiles">Large Files (&gt;10MB)</option>
            </select>
          </div>

          {selectedFileIdsToDelete.length > 0 && (
            <button
              onClick={handleBatchDelete}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-red-500/25 transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge {selectedFileIdsToDelete.length} Selected Duplicates</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter & Batch Selector */}
      <div className="p-4 rounded-2xl glass-card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['All', 'PDFs', 'Documents', 'Images', 'Archives', 'Other Files'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedGroupCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedGroupCategory === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={selectAllDuplicates}
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Select All Copies
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            onClick={deselectAll}
            className="font-semibold text-slate-500 hover:underline"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Duplicate Groups List */}
      <div className="space-y-4">
        {filteredGroups.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Zero Duplicate Files Detected</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your storage is completely clean of redundant duplicate files. Upload additional files or click "Scan for Duplicates" to analyze.
            </p>
          </div>
        ) : (
          filteredGroups.map((group, groupIdx) => {
            const originalFile = files.find(f => f.id === group.originalFileId);
            const duplicateCopies = files.filter(f => group.duplicateFileIds.includes(f.id));

            return (
              <div
                key={group.id}
                className="rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition"
              >
                {/* Group Card Header */}
                <div className="p-4 px-6 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      Cluster #{groupIdx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{group.sampleFileName}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {group.fileCount} total copies • {group.category} • Wasted Storage: <span className="font-bold text-red-500">{formatBytes(group.wastedSize)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDuplicateGroupForCompare(group)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-slate-50 transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Compare Side-by-Side</span>
                    </button>
                  </div>
                </div>

                {/* Files inside this group */}
                <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800/60 space-y-2">
                  {/* Original File Target Row */}
                  {originalFile && (
                    <div className="pt-2 flex items-center justify-between gap-3 bg-emerald-50/30 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-500/20">
                      <div className="flex items-center gap-3 truncate">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
                          ORIGINAL
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{originalFile.name}</p>
                          <p className="text-[10px] text-slate-500">
                            Location: {originalFile.folderPath || 'Root'} • {formatBytes(originalFile.size)} • Created: {formatDate(originalFile.createdAt)}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Retained
                      </span>
                    </div>
                  )}

                  {/* Duplicate Copies Rows */}
                  {duplicateCopies.map((dup) => {
                    const isSelected = selectedFileIdsToDelete.includes(dup.id);
                    return (
                      <div
                        key={dup.id}
                        onClick={() => toggleSelectFile(dup.id)}
                        className={`pt-2 flex items-center justify-between gap-3 p-3 rounded-2xl cursor-pointer transition ${
                          isSelected ? 'bg-red-50/40 dark:bg-red-950/20 border border-red-300 dark:border-red-900/60' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectFile(dup.id)}
                            className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                          />
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{dup.name}</p>
                            <p className="text-[10px] text-slate-500">
                              Location: {dup.folderPath || 'Root'} • {formatBytes(dup.size)} • Modified: {formatDate(dup.lastModified)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline-block">
                            SHA: {dup.hash.slice(0, 12)}...
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
                            Duplicate Copy
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

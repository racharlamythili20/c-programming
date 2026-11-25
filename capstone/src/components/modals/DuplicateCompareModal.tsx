import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBytes, formatDate } from '../../services/fileProcessor';
import {
  X,
  ShieldCheck,
  Check,
  Trash2,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  HardDrive,
  Calendar,
  Folder,
  AlertTriangle,
  RotateCw
} from 'lucide-react';

export const DuplicateCompareModal: React.FC = () => {
  const {
    selectedDuplicateGroupForCompare,
    setSelectedDuplicateGroupForCompare,
    files,
    deleteFiles,
    addNotification
  } = useApp();

  if (!selectedDuplicateGroupForCompare) return null;
  const group = selectedDuplicateGroupForCompare;

  // Find original file and duplicates
  const originalFile = files.find(f => f.id === group.originalFileId);
  const duplicateFiles = files.filter(f => group.duplicateFileIds.includes(f.id));

  const [selectedToDelete, setSelectedToDelete] = useState<string[]>(group.duplicateFileIds);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSelectToDelete = (id: string) => {
    if (selectedToDelete.includes(id)) {
      setSelectedToDelete(selectedToDelete.filter(item => item !== id));
    } else {
      setSelectedToDelete([...selectedToDelete, id]);
    }
  };

  const selectAll = () => {
    setSelectedToDelete(group.duplicateFileIds);
  };

  const deselectAll = () => {
    setSelectedToDelete([]);
  };

  const handleDeleteDuplicates = async () => {
    if (selectedToDelete.length === 0) return;
    setIsDeleting(true);
    await deleteFiles(selectedToDelete, 'Purged duplicate copies');
    setIsDeleting(false);
    setSelectedDuplicateGroupForCompare(null);
    addNotification('Duplicates Cleaned', `Removed ${selectedToDelete.length} redundant file(s). Original preserved.`, 'success');
  };

  const recoverableFromSelected = (originalFile?.size || 0) * selectedToDelete.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {group.similarityPercentage}% Cryptographic Match
              </span>
              <span className="text-xs text-slate-500">Method: SHA-256 Digest Analysis</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              Side-by-Side Duplicate File Inspector
            </h3>
          </div>
          <button
            onClick={() => setSelectedDuplicateGroupForCompare(null)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Recovery Overview Pill */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-emerald-500/10 border border-blue-500/20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Group Redundancy:</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {group.fileCount} Copies • {formatBytes(group.wastedSize)} Wasted Storage
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                Select All Copies
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Comparison Split Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ORIGINAL FILE CARD */}
            <div className="lg:col-span-5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Check className="w-3.5 h-3.5" /> Retained Original
                  </span>
                  <span className="text-xs text-slate-500">Safest to keep</span>
                </div>

                {originalFile ? (
                  <div className="space-y-4">
                    {/* Preview box */}
                    <div className="h-40 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-3 overflow-hidden">
                      {originalFile.category === 'Images' && (originalFile.blobUrl || originalFile.textContent) ? (
                        <img
                          src={originalFile.blobUrl || 'data:image/svg+xml;utf8,' + encodeURIComponent(originalFile.textContent || '')}
                          alt={originalFile.name}
                          className="max-h-full object-contain rounded-lg"
                        />
                      ) : originalFile.textContent ? (
                        <div className="w-full h-full text-[10px] font-mono text-slate-600 dark:text-slate-400 overflow-hidden line-clamp-6">
                          {originalFile.textContent}
                        </div>
                      ) : (
                        <FileText className="w-12 h-12 text-slate-400" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm break-all">{originalFile.name}</h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Original File Target</p>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <HardDrive className="w-3 h-3" /> Size:
                        </span>
                        <span className="font-semibold">{formatBytes(originalFile.size)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Folder className="w-3 h-3" /> Location:
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{originalFile.folderPath || 'Root'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Created:
                        </span>
                        <span>{formatDate(originalFile.createdAt)}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Verified SHA-256 Hash:</span>
                      <p className="font-mono text-[10px] break-all p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 mt-1">
                        {originalFile.hash}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Original record not found.</p>
                )}
              </div>
            </div>

            {/* DUPLICATE COPIES LIST */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Duplicate Copies Identified ({duplicateFiles.length})
                </span>
                <span className="text-xs text-slate-500">Select which copies to purge</span>
              </div>

              {duplicateFiles.map((dup, index) => {
                const isSelected = selectedToDelete.includes(dup.id);
                return (
                  <div
                    key={dup.id}
                    onClick={() => toggleSelectToDelete(dup.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
                      isSelected
                        ? 'bg-red-50/40 dark:bg-red-950/20 border-red-300 dark:border-red-800/80 shadow-sm'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectToDelete(dup.id)}
                        className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                              Duplicate #{index + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white break-all">{dup.name}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                            <Folder className="w-3 h-3" /> {dup.folderPath || 'Root'}
                          </p>
                        </div>

                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {formatBytes(dup.size)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span>Modified: {formatDate(dup.lastModified)}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% Hash Match</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>
              Safe Deletion Guard: The original file will remain completely untouched.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedDuplicateGroupForCompare(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteDuplicates}
              disabled={selectedToDelete.length === 0 || isDeleting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-red-500/25 transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting
                ? 'Purging Duplicates...'
                : `Purge ${selectedToDelete.length} Selected Duplicate(s) (Recover ${formatBytes(recoverableFromSelected)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

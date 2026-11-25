import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CleanupRecommendation, RiskLevel } from '../types';
import { formatBytes } from '../services/fileProcessor';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Zap,
  Info,
  Clock,
  HardDrive,
  Copy,
  FolderMinus,
  RotateCcw
} from 'lucide-react';

export const CleanupAssistantPage: React.FC = () => {
  const {
    recommendations,
    applyCleanupRecommendation,
    files,
    duplicateGroups,
    setSelectedFileForPreview
  } = useApp();

  const [activeRecId, setActiveRecId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const totalPotentialSavings = recommendations.reduce((acc, r) => acc + r.potentialSavings, 0);

  // Health Score calculation (100 minus penalties for duplicates, unorganized, temp files)
  const duplicatePenalty = Math.min(duplicateGroups.length * 5, 25);
  const unorganizedCount = files.filter(f => !f.folderPath || f.folderPath === '/').length;
  const unorganizedPenalty = Math.min(unorganizedCount * 2, 20);
  const healthScore = Math.max(100 - duplicatePenalty - unorganizedPenalty, 45);

  const handleExecuteCleanup = async (recId: string) => {
    setIsProcessing(true);
    await applyCleanupRecommendation(recId);
    setIsProcessing(false);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'low':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Low Risk (Safe)
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Medium Risk (Review First)
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> High Risk
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Hygiene & Disk Pruning</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            File Cleanup Assistant
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Identify redundant copies, dormant legacy files, empty directories, and temporary system bloat.
          </p>
        </div>
      </div>

      {/* Health Score & Quick Summary Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/20 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Gauge */}
        <div className="md:col-span-4 flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full bg-white dark:bg-slate-900 border-4 border-emerald-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{healthScore}</span>
            <span className="text-[10px] absolute -bottom-2 px-1.5 py-0.5 rounded bg-emerald-500 text-white font-bold">
              Health
            </span>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Storage Health Rating</h4>
            <p className="text-xs text-slate-500">Calculated from duplication & directory organization index</p>
          </div>
        </div>

        {/* Savings pill */}
        <div className="md:col-span-8 flex flex-col sm:flex-row items-start sm:items-center justify-end gap-6">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase font-semibold">Total Optimization Savings:</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatBytes(totalPotentialSavings)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase font-semibold">Actionable Recommendations:</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {recommendations.length} Pending
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Your Storage is 100% Clean!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No duplicate bloat, temporary system files, or unorganized root files detected.
            </p>
          </div>
        ) : (
          recommendations.map((rec) => {
            const affectedFiles = files.filter(f => rec.affectedFileIds.includes(f.id));
            const isExpanded = activeRecId === rec.id;

            return (
              <div
                key={rec.id}
                className="rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm transition hover:shadow-md"
              >
                <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      {getRiskBadge(rec.riskLevel)}
                      <span className="text-xs font-semibold text-slate-400">
                        {affectedFiles.length} file(s) affected
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {rec.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                      {rec.description}
                    </p>

                    {rec.potentialSavings > 0 && (
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Recoverable Space: {formatBytes(rec.potentialSavings)}
                      </p>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2.5 self-end md:self-center">
                    <button
                      onClick={() => setActiveRecId(isExpanded ? null : rec.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                    >
                      {isExpanded ? 'Hide Files' : `Review Files (${affectedFiles.length})`}
                    </button>

                    <button
                      onClick={() => handleExecuteCleanup(rec.id)}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
                      <span>{rec.recommendedAction}</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Affected Files Preview Drawer */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Affected File Registry:
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {affectedFiles.map((file) => (
                        <div
                          key={file.id}
                          onClick={() => setSelectedFileForPreview(file)}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between gap-3 cursor-pointer hover:border-blue-400 transition"
                        >
                          <div className="truncate">
                            <span className="font-bold text-slate-900 dark:text-white truncate block">{file.name}</span>
                            <span className="text-[10px] text-slate-400">{file.folderPath || 'Root'} • {formatBytes(file.size)}</span>
                          </div>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Inspect</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

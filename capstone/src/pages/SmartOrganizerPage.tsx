import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { FileCategory, OrganizationProposal } from '../types';
import { formatBytes } from '../services/fileProcessor';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Check,
  X,
  Upload,
  FolderTree,
  FolderPlus,
  ArrowRight,
  ShieldAlert,
  Info,
  CheckCircle2,
  Undo2,
  FileText,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Layers
} from 'lucide-react';

export const SmartOrganizerPage: React.FC = () => {
  const {
    files,
    folders,
    applyOrganizationProposals,
    uploadFiles,
    activityLogs,
    undoAction
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('All');
  const [isApplying, setIsApplying] = useState(false);

  // Generate proposals for unorganized files or all files in root
  const [proposals, setProposals] = useState<OrganizationProposal[]>(() => {
    return files
      .filter(f => !f.folderPath || f.folderPath === '/' || f.folderPath === 'Root')
      .map(f => ({
        fileId: f.id,
        fileName: f.name,
        currentFolder: f.folderPath || 'Root',
        proposedFolder: f.aiSuggestedFolder || `${f.category} / Organized`,
        category: f.category,
        confidence: f.aiConfidence || 92,
        reason: f.aiReason || `Categorized under ${f.category} by file extension and metadata pattern.`,
        status: 'pending' as const
      }));
  });

  // Keep proposals synchronized if new files are uploaded
  React.useEffect(() => {
    const unorganized = files.filter(f => !f.folderPath || f.folderPath === '/' || f.folderPath === 'Root');
    setProposals(prev => {
      const existingMap = new Map(prev.map(p => [p.fileId, p]));
      return unorganized.map(f => {
        if (existingMap.has(f.id)) return existingMap.get(f.id)!;
        return {
          fileId: f.id,
          fileName: f.name,
          currentFolder: f.folderPath || 'Root',
          proposedFolder: f.aiSuggestedFolder || `${f.category} / Organized`,
          category: f.category,
          confidence: f.aiConfidence || 92,
          reason: f.aiReason || `Categorized under ${f.category} by file extension.`,
          status: 'pending' as const
        };
      });
    });
  }, [files]);

  const categories: string[] = [
    'All',
    'Documents',
    'Images',
    'Videos',
    'Audio',
    'Archives',
    'Programming Files',
    'Presentations',
    'Spreadsheets',
    'PDFs',
    'Other Files'
  ];

  const filteredProposals = proposals.filter(p => {
    if (selectedCategoryTab === 'All') return true;
    return p.category === selectedCategoryTab;
  });

  const acceptProposal = (fileId: string) => {
    setProposals(prev => prev.map(p => (p.fileId === fileId ? { ...p, status: 'accepted' } : p)));
  };

  const rejectProposal = (fileId: string) => {
    setProposals(prev => prev.map(p => (p.fileId === fileId ? { ...p, status: 'rejected' } : p)));
  };

  const acceptAll = () => {
    setProposals(prev => prev.map(p => ({ ...p, status: 'accepted' })));
  };

  const resetAll = () => {
    setProposals(prev => prev.map(p => ({ ...p, status: 'pending' })));
  };

  const handleApplyOrganization = async () => {
    // If none explicitly accepted, accept all pending
    let toApply = proposals.filter(p => p.status === 'accepted');
    if (toApply.length === 0) {
      toApply = proposals.filter(p => p.status !== 'rejected');
      toApply.forEach(p => (p.status = 'accepted'));
    }

    if (toApply.length === 0) return;

    setIsApplying(true);
    await applyOrganizationProposals(toApply);
    setIsApplying(false);

    // Fire celebration confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Find last organize activity log for quick undo
  const lastOrganizeLog = activityLogs.find(l => l.action === 'ORGANIZE' && l.canUndo);

  const acceptedCount = proposals.filter(p => p.status === 'accepted').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Neural Classification Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Smart File Organizer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automatic multi-tier semantic folder routing with confidence validation and preview confirmation.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {lastOrganizeLog && (
            <button
              onClick={() => undoAction(lastOrganizeLog.id)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-700"
              title="Undo last organization batch"
            >
              <Undo2 className="w-4 h-4 text-amber-500" />
              <span>Undo Last Auto-Sort</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-4 h-4 text-blue-500" />
            <span>Upload New Files</span>
          </button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        multiple
        className="hidden"
      />

      {/* Category Tabs */}
      <div className="p-4 rounded-2xl glass-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryTab(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategoryTab === cat
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={acceptAll}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Accept All ({proposals.length})
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={resetAll}
              className="text-xs font-semibold text-slate-500 hover:underline"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Proposed Hierarchy Summary & Execute Card */}
      {proposals.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-violet-600/10 via-blue-600/10 to-indigo-600/10 border border-violet-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              Proposed Organization Ready ({proposals.length} files evaluated)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review AI semantic suggestions below. Files will only be relocated after your approval.
            </p>
          </div>

          <button
            onClick={handleApplyOrganization}
            disabled={isApplying || proposals.length === 0}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isApplying ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Applying Hierarchies...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Apply Organization ({acceptedCount > 0 ? acceptedCount : proposals.length} Files)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Proposals List */}
      <div className="space-y-3">
        {filteredProposals.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">All Files Currently Organized!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No unorganized root files detected in this category. Upload additional files to generate new AI recommendations.
            </p>
          </div>
        ) : (
          filteredProposals.map((proposal) => {
            const isAccepted = proposal.status === 'accepted';
            const isRejected = proposal.status === 'rejected';

            return (
              <div
                key={proposal.fileId}
                className={`p-4 rounded-2xl glass-card border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isAccepted
                    ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : isRejected
                    ? 'border-red-300/60 dark:border-red-900/40 opacity-60'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* File Details & Proposed Path */}
                <div className="flex items-start gap-3.5 flex-1 overflow-hidden">
                  <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-md">
                        {proposal.fileName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                        {proposal.confidence}% Confidence
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Category: {proposal.category}
                      </span>
                    </div>

                    {/* Routing Path Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs flex-wrap font-medium">
                      <span className="text-slate-400">{proposal.currentFolder}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                        {proposal.proposedFolder}
                      </span>
                    </div>

                    {/* AI Reasoning Text */}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Reason: </span>
                      {proposal.reason}
                    </p>
                  </div>
                </div>

                {/* Accept / Reject Action Controls */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => acceptProposal(proposal.fileId)}
                    className={`p-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                      isAccepted
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                    }`}
                    title="Accept this folder suggestion"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isAccepted ? 'Accepted' : 'Accept'}</span>
                  </button>

                  <button
                    onClick={() => rejectProposal(proposal.fileId)}
                    className={`p-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                      isRejected
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
                    }`}
                    title="Keep file in current directory"
                  >
                    <X className="w-4 h-4" />
                    <span>{isRejected ? 'Rejected' : 'Skip'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

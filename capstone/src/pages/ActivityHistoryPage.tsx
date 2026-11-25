import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../services/fileProcessor';
import { ActivityAction } from '../types';
import {
  History,
  Undo2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  FolderInput,
  Sparkles,
  Upload,
  Edit3
} from 'lucide-react';

export const ActivityHistoryPage: React.FC = () => {
  const { activityLogs, undoAction } = useApp();
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredLogs = activityLogs.filter(log => {
    if (filterAction === 'ALL') return true;
    return log.action === filterAction;
  });

  const getActionIcon = (action: ActivityAction) => {
    switch (action) {
      case 'UPLOAD': return <Upload className="w-4 h-4 text-blue-500" />;
      case 'ORGANIZE': return <Sparkles className="w-4 h-4 text-violet-500" />;
      case 'MOVE': return <FolderInput className="w-4 h-4 text-indigo-500" />;
      case 'RENAME': return <Edit3 className="w-4 h-4 text-cyan-500" />;
      case 'DUPLICATE_DELETE':
      case 'CLEANUP': return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'FOLDER_CREATE': return <Sparkles className="w-4 h-4 text-emerald-500" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            Success
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
            Warning
          </span>
        );
      case 'error':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
            Error
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Info
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail & Rollback Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Activity History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete cryptographic audit trail of file reorganizations, scans, moves, and deletions with instant rollback capability.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-4 rounded-2xl glass-card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Operations' },
            { id: 'UPLOAD', label: 'Uploads' },
            { id: 'ORGANIZE', label: 'AI Organization' },
            { id: 'MOVE', label: 'Moves' },
            { id: 'RENAME', label: 'Renames' },
            { id: 'DUPLICATE_DELETE', label: 'Purges & Deletions' },
            { id: 'FOLDER_CREATE', label: 'Folder Events' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterAction(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                filterAction === f.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400">
          Showing {filteredLogs.length} events
        </span>
      </div>

      {/* Events Timeline */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
            <History className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Activity Logs Found</h4>
            <p className="text-xs text-slate-400">Operations and file events will appear here in chronological order.</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-sm transition"
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 mt-0.5">
                  {getActionIcon(log.action)}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {log.title}
                    </span>
                    {getStatusBadge(log.status)}
                    <span className="text-[10px] text-slate-400">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                    {log.description}
                  </p>
                </div>
              </div>

              {/* Working Undo Button */}
              {log.canUndo && (
                <button
                  onClick={() => undoAction(log.id)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition flex items-center gap-1.5 self-end sm:self-center flex-shrink-0"
                  title="Rollback this operation"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

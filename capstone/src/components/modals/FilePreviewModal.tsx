import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBytes, formatDate } from '../../services/fileProcessor';
import {
  X,
  Download,
  Trash2,
  Star,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Code,
  Archive,
  Copy,
  Check,
  Sparkles,
  Tag,
  Calendar,
  HardDrive
} from 'lucide-react';

export const FilePreviewModal: React.FC = () => {
  const { selectedFileForPreview, setSelectedFileForPreview, deleteFiles, toggleFavorite, addNotification } = useApp();
  const [copiedHash, setCopiedHash] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  if (!selectedFileForPreview) return null;
  const file = selectedFileForPreview;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
    addNotification('Copied', 'SHA-256 Hash copied to clipboard', 'info');
  };

  const handleDownload = () => {
    if (file.blobUrl) {
      const a = document.createElement('a');
      a.href = file.blobUrl;
      a.download = file.name;
      a.click();
    } else if (file.textContent) {
      const blob = new Blob([file.textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      addNotification('Download unavailable', 'File data was not persisted in memory.', 'warning');
    }
  };

  const handleDelete = async () => {
    await deleteFiles([file.id], 'Deleted from preview dialog');
    setSelectedFileForPreview(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              {file.category === 'Images' ? <ImageIcon className="w-5 h-5" /> :
               file.category === 'Videos' ? <Film className="w-5 h-5" /> :
               file.category === 'Audio' ? <Music className="w-5 h-5" /> :
               file.category === 'Programming Files' ? <Code className="w-5 h-5" /> :
               file.category === 'Archives' ? <Archive className="w-5 h-5" /> :
               <FileText className="w-5 h-5" />}
            </div>
            <div className="truncate">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{file.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{formatBytes(file.size)} • {file.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(file.id)}
              className={`p-2 rounded-xl transition ${
                file.isFavorite
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800'
              }`}
              title="Toggle Favorite"
            >
              <Star className={`w-4 h-4 ${file.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedFileForPreview(null)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          {/* Main Visual Preview Area */}
          <div className="md:col-span-7 flex flex-col items-center justify-center min-h-[300px] bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-4 overflow-hidden">
            {file.category === 'Images' && (file.blobUrl || file.textContent) ? (
              <img
                src={file.blobUrl || 'data:image/svg+xml;utf8,' + encodeURIComponent(file.textContent || '')}
                alt={file.name}
                className="max-h-[360px] object-contain rounded-xl shadow-md"
              />
            ) : file.category === 'Audio' && file.blobUrl ? (
              <div className="w-full flex flex-col items-center gap-4 py-8">
                <Music className="w-16 h-16 text-pink-500 animate-pulse" />
                <audio controls src={file.blobUrl} className="w-full max-w-md" />
              </div>
            ) : file.category === 'Videos' && file.blobUrl ? (
              <video controls src={file.blobUrl} className="max-h-[360px] w-full rounded-xl shadow-md" />
            ) : file.textContent ? (
              <div className="w-full h-full max-h-[360px] overflow-auto bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono leading-relaxed shadow-inner">
                <pre>{file.textContent}</pre>
              </div>
            ) : (
              <div className="text-center p-8">
                <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Preview not available for this binary format</p>
                <p className="text-xs text-slate-400 mt-1">File metadata and cryptographic hash are verified below</p>
              </div>
            )}
          </div>

          {/* Metadata & AI Insights */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* AI Classification Card */}
              {file.aiSuggestedFolder && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/20 border border-violet-200/60 dark:border-violet-900/40">
                  <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                    AI Semantic Classification
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {file.aiSuggestedFolder}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-200/60 dark:bg-violet-900/60 font-semibold text-violet-800 dark:text-violet-200">
                      {file.aiConfidence || 95}% Confidence
                    </span>
                  </div>
                  {file.aiReason && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {file.aiReason}
                    </p>
                  )}
                </div>
              )}

              {/* Technical Metadata */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5" /> File Size:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatBytes(file.size)} ({file.size.toLocaleString()} B)</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Last Modified:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(file.lastModified)}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">MIME Type:</span>
                  <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{file.type}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Virtual Location:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400 truncate max-w-[180px]">{file.folderPath || 'Root'}</span>
                </div>

                {/* SHA-256 Hash with Copy */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold uppercase tracking-wider">SHA-256 Digest:</span>
                    <button
                      onClick={() => copyToClipboard(file.hash)}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedHash ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 font-mono text-[10px] break-all text-slate-600 dark:text-slate-400 select-all border border-slate-200/40 dark:border-slate-800">
                    {file.hash}
                  </div>
                </div>

                {/* Tags */}
                {file.tags && file.tags.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-1.5">
                      <Tag className="w-3 h-3" /> AI Tags:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {file.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-2 flex items-center justify-between gap-3">
              {isConfirmDelete ? (
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md transition"
                  >
                    Confirm Permanent Delete
                  </button>
                  <button
                    onClick={() => setIsConfirmDelete(false)}
                    className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsConfirmDelete(true)}
                    className="py-2.5 px-4 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete File
                  </button>
                  <button
                    onClick={handleDownload}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

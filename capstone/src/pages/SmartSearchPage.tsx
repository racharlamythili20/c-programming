import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatBytes, formatDate } from '../services/fileProcessor';
import {
  Search,
  Filter,
  FileText,
  SlidersHorizontal,
  X,
  Calendar,
  HardDrive,
  Folder,
  Tag,
  ArrowUpDown,
  CheckCircle2,
  Eye,
  Star
} from 'lucide-react';

export const SmartSearchPage: React.FC = () => {
  const { files, setSelectedFileForPreview, toggleFavorite } = useApp();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sizeFilter, setSizeFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'old'>('all');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);

  const categories = [
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

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const filteredResults = files.filter(f => {
    // 1. Text Query (name, extension, SHA-256 hash, or text snippet)
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchName = f.name.toLowerCase().includes(q);
      const matchExt = f.extension.toLowerCase().includes(q);
      const matchHash = f.hash.toLowerCase().includes(q);
      const matchText = f.textContent?.toLowerCase().includes(q);
      const matchTags = f.tags?.some(t => t.toLowerCase().includes(q));

      if (!matchName && !matchExt && !matchHash && !matchText && !matchTags) {
        return false;
      }
    }

    // 2. Category
    if (selectedCategory !== 'All' && f.category !== selectedCategory) {
      return false;
    }

    // 3. Size Filter
    if (sizeFilter === 'small' && f.size > 1024 * 1024) return false; // < 1MB
    if (sizeFilter === 'medium' && (f.size <= 1024 * 1024 || f.size > 20 * 1024 * 1024)) return false; // 1MB - 20MB
    if (sizeFilter === 'large' && f.size <= 20 * 1024 * 1024) return false; // > 20MB

    // 4. Date Filter
    if (dateFilter === 'today' && now - f.lastModified > dayMs) return false;
    if (dateFilter === 'week' && now - f.lastModified > 7 * dayMs) return false;
    if (dateFilter === 'month' && now - f.lastModified > 30 * dayMs) return false;
    if (dateFilter === 'old' && now - f.lastModified < 180 * dayMs) return false;

    // 5. Flags
    if (favoriteOnly && !f.isFavorite) return false;
    if (duplicatesOnly && !f.isDuplicate) return false;

    return true;
  });

  const clearFilters = () => {
    setQuery('');
    setSelectedCategory('All');
    setSizeFilter('all');
    setDateFilter('all');
    setFavoriteOnly(false);
    setDuplicatesOnly(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
          <Search className="w-3.5 h-3.5" />
          <span>Multi-Facet Search Engine</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Smart Search
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Query filenames, extensions, SHA-256 cryptographic hashes, or inner document text samples instantly.
        </p>
      </div>

      {/* Main Search Input & Filter Dashboard */}
      <div className="p-6 rounded-3xl glass-card space-y-5">
        {/* Input box */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type filename, extension (.pdf, .tsx), cryptographic SHA-256 hash, or text snippet..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition shadow-inner"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Facet Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Category Dropdown */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 border-transparent focus:outline-none cursor-pointer"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Size Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">File Size</label>
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 border-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">Any Size</option>
              <option value="small">&lt; 1 MB (Small)</option>
              <option value="medium">1 MB - 20 MB (Medium)</option>
              <option value="large">&gt; 20 MB (Large)</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Time Modified</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 border-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">Any Time</option>
              <option value="today">Past 24 Hours</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
              <option value="old">&gt; 180 Days (Old)</option>
            </select>
          </div>

          {/* Quick Filter Toggles */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Attributes</label>
            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={favoriteOnly}
                  onChange={(e) => setFavoriteOnly(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>Favorites</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 ml-2">
                <input
                  type="checkbox"
                  checked={duplicatesOnly}
                  onChange={(e) => setDuplicatesOnly(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <span>Duplicates</span>
              </label>
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(query || selectedCategory !== 'All' || sizeFilter !== 'all' || dateFilter !== 'all' || favoriteOnly || duplicatesOnly) && (
          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear All Search Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>Search Results ({filteredResults.length} matches)</span>
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
            <Search className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Matching Files Found</h4>
            <p className="text-xs text-slate-400">Try modifying your query or clearing filter parameters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredResults.map((file) => (
              <div
                key={file.id}
                onClick={() => setSelectedFileForPreview(file)}
                className="p-4 rounded-2xl glass-card hover:border-blue-500/60 hover:shadow-md transition cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 truncate flex-1">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {file.name}
                      </span>
                      {file.isFavorite && <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />}
                      {file.isDuplicate && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-600">
                          Duplicate
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>{file.category}</span>
                      <span>•</span>
                      <span>{formatBytes(file.size)}</span>
                      <span>•</span>
                      <span>{file.folderPath || 'Root'}</span>
                      <span>•</span>
                      <span>Modified: {formatDate(file.lastModified)}</span>
                    </div>

                    {/* Content snippet preview if present */}
                    {file.textContent && query && file.textContent.toLowerCase().includes(query.toLowerCase()) && (
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-mono line-clamp-2 mt-1">
                        ...{file.textContent}...
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFileForPreview(file);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 self-end md:self-center"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
